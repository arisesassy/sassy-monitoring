import os
import time
from typing import List, Literal, Optional
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Security, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field
from supabase import Client, create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
FASTAPI_SECRET = os.getenv("FASTAPI_SECRET")

app = FastAPI(
    title="SASSY PID Optimization Service",
    description="Backend service untuk training & optimasi parameter PID mesin pengering SASSY.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)


def get_supabase_client() -> Client:
    """Inisialisasi Supabase client dengan service role key (bypass RLS)."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase credentials tidak terkonfigurasi di server.",
        )
    try:
        return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Gagal menghubungkan ke Supabase: {str(e)}",
        )


def verify_secret(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
):
    """Verifikasi shared secret token antara Next.js dan FastAPI."""
    if not FASTAPI_SECRET:
        # Jika FASTAPI_SECRET belum diset di Render, tolak demi keamanan
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="FASTAPI_SECRET belum dikonfigurasi di environment.",
        )
    if not credentials or credentials.credentials != FASTAPI_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token otorisasi tidak valid atau tidak disertakan.",
        )


class TrainRequest(BaseModel):
    material_type: Optional[Literal["Kain", "Kulit"]] = Field(
        default=None,
        description="Filter bahan spesifik untuk di-train. Jika null, kedua bahan dilatih.",
    )
    session_id: Optional[str] = Field(
        default=None,
        description="Opsional: ID sesi telemetri spesifik yang dijadikan dasar training.",
    )


class PidValue(BaseModel):
    material_type: str
    kp: float
    ki: float
    kd: float


class TrainResponse(BaseModel):
    status: str
    message: str
    telemetry_samples: int
    parameters: List[PidValue]


@app.get("/")
def root():
    return {
        "service": "SASSY PID Optimization Service",
        "version": "1.0.0",
        "status": "online",
        "endpoints": {
            "health": "/health",
            "train": "POST /train-pid (requires Bearer token)",
        },
    }


@app.get("/health")
def health_check():
    """Health check endpoint untuk Render / keepalive."""
    supabase_configured = bool(SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)
    secret_configured = bool(FASTAPI_SECRET)
    return {
        "status": "ok",
        "timestamp": time.time(),
        "supabase_configured": supabase_configured,
        "secret_configured": secret_configured,
    }


@app.post("/train-pid", response_model=TrainResponse)
def train_pid(
    payload: Optional[TrainRequest] = None,
    _auth=Depends(verify_secret),
):
    """
    Endpoint training PID:
    1. Membaca telemetri dari Supabase.
    2. Menjalankan model optimasi PID (sementara: mock delay + parameter rekomendasi).
    3. Mengarsipkan usulan pending_review lama agar tidak menumpuk.
    4. Menulis usulan baru ke tabel `pid_parameters` dengan status `pending_review`.
    5. Dashboard akan menerima trigger Realtime dan menampilkan modal konfirmasi.
    """
    supabase = get_supabase_client()

    # 1. Cek jumlah data telemetri yang tersedia
    telemetry_count = 0
    try:
        telemetry_query = supabase.table("telemetry").select("id", count="exact")
        if payload and payload.session_id:
            telemetry_query = telemetry_query.eq("session_id", payload.session_id)
        if payload and payload.material_type:
            telemetry_query = telemetry_query.eq("material_type", payload.material_type)

        res = telemetry_query.limit(1).execute()
        telemetry_count = res.count or 0
    except Exception as e:
        # Telemetri gagal di-query tapi proses tetap lanjut jika mock
        print(f"[WARN] Gagal query telemetri: {e}")

    # 2. Simulasi proses training (delay 2 detik)
    # TODO: Ganti blok ini dengan inferensi model ML sebenarnya
    # (misal: load model weights, input telemetri -> optimasi GA/RL/Ziegler-Nichols -> output Kp, Ki, Kd)
    time.sleep(2.0)

    # 3. Tentukan parameter rekomendasi baru (mock optimal)
    # Nilai ini sedikit berbeda dari default untuk simulasi tuning
    candidates = []
    if not payload or not payload.material_type or payload.material_type == "Kain":
        candidates.append(
            {
                "material_type": "Kain",
                "kp": 8.50,
                "ki": 0.09,
                "kd": 11.20,
                "status": "pending_review",
                "created_by": "fastapi-training",
            }
        )
    if not payload or not payload.material_type or payload.material_type == "Kulit":
        candidates.append(
            {
                "material_type": "Kulit",
                "kp": 7.00,
                "ki": 0.06,
                "kd": 9.10,
                "status": "pending_review",
                "created_by": "fastapi-training",
            }
        )

    # 4. Arsipkan pending_review lama untuk bahan terkait
    try:
        materials_to_archive = [c["material_type"] for c in candidates]
        supabase.table("pid_parameters").update(
            {"status": "archived"}
        ).eq("status", "pending_review").in_(
            "material_type", materials_to_archive
        ).execute()
    except Exception as e:
        print(f"[WARN] Gagal mengarsipkan pending_review lama: {e}")

    # 5. Tulis parameter baru berstatus `pending_review`
    try:
        insert_res = supabase.table("pid_parameters").insert(candidates).execute()
        inserted_data = insert_res.data or []
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal menyimpan usulan PID ke database: {str(e)}",
        )

    return TrainResponse(
        status="success",
        message="Parameter PID optimal berhasil dihitung dan menunggu persetujuan admin di dashboard.",
        telemetry_samples=telemetry_count,
        parameters=[
            PidValue(
                material_type=row["material_type"],
                kp=float(row["kp"]),
                ki=float(row["ki"]),
                kd=float(row["kd"]),
            )
            for row in candidates
        ],
    )
