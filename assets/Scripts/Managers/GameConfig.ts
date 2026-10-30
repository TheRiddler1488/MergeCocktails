import { EventTarget, Vec3 } from 'cc';

export const GameConfig = {
    GridWidth: 5,
    GridHeight: 6,
    CellSize: 70,
    CellSpacing: 0,
    SpawnCost: 15,
    MaxTier: 10
};

export const GameEvents = {
    ITEM_MERGED: 'ITEM_MERGED',
    ORDER_COMPLETED: 'ORDER_COMPLETED'
};

export const EventBus = new EventTarget();
export const TempVec3 = new Vec3();
