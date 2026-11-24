from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.monitoring import MonitoredSource, Notification, SourceVersion
from app.schemas.monitoring import MonitoredSourceOut, NotificationOut, SourceVersionOut
from app.services.monitoring_service import monitoring_service
from app.api.routes_profile import get_or_create_default_user

router = APIRouter(prefix="/monitoring", tags=["Monitoring & Notifications"])

@router.get("/sources", response_model=List[MonitoredSourceOut])
def list_sources(db: Session = Depends(get_db)):
    monitoring_service.seed_default_sources(db)
    return db.query(MonitoredSource).all()

@router.post("/check")
async def trigger_check(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    monitoring_service.seed_default_sources(db)
    sources = db.query(MonitoredSource).all()
    notifications_created = 0
    for s in sources:
        notif = await monitoring_service.check_source(s, db, user)
        if notif:
            notifications_created += 1
    return {
        "status": "success",
        "sources_checked": len(sources),
        "notifications_generated": notifications_created
    }

@router.get("/notifications", response_model=List[NotificationOut])
def list_notifications(unread_only: bool = False, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    query = db.query(Notification).filter(Notification.user_id == user.id)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    return query.order_by(Notification.created_at.desc()).all()

@router.put("/notifications/{notification_id}/read")
def mark_read(notification_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"status": "success", "id": notif.id}
