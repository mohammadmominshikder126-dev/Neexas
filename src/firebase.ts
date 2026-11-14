import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { BannerSlide, GlobalSettings, Plan } from './types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'settings', 'global'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
    return false;
  }
}

export async function signInAdminWithGoogle(): Promise<FirebaseUser> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOutFirebase(): Promise<void> {
  await signOut(auth);
}

export function observeFirebaseAuth(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function subscribePublicSettings(
  onData: (settings: GlobalSettings) => void,
  onError?: (err: unknown) => void
) {
  return onSnapshot(
    doc(db, 'settings', 'global'),
    (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        const updatedAtIso =
          d.updatedAt && typeof d.updatedAt.toDate === 'function'
            ? d.updatedAt.toDate().toISOString()
            : typeof d.updatedAt === 'string'
            ? d.updatedAt
            : undefined;
        onData({
          supportGroupUrl: String(d.supportGroupUrl || ''),
          supportChannelUrl: String(d.supportChannelUrl || ''),
          bkashNumber: String(d.bkashNumber || ''),
          nagadNumber: String(d.nagadNumber || ''),
          minDeposit: Number(d.minDeposit ?? 150),
          minWithdraw: Number(d.minWithdraw ?? 200),
          welcomeBonus: Number(d.welcomeBonus ?? 100),
          level1Rate: Number(d.level1Rate ?? 20),
          level2Rate: Number(d.level2Rate ?? 2),
          level3Rate: Number(d.level3Rate ?? 1),
          updatedAt: updatedAtIso,
        });
      }
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export function subscribePublicPlans(
  onData: (plans: Plan[]) => void,
  onError?: (err: unknown) => void
) {
  const q = query(collection(db, 'plans'), where('active', '==', true));
  return onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot.empty) {
        const items: Plan[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: String(d.id || docSnap.id),
            name: String(d.name || ''),
            price: Number(d.price || 0),
            dailyIncome: Number(d.dailyIncome || 0),
            totalIncome: Number(d.totalIncome || 0),
            validityDays: Number(d.validityDays || 30),
            imageUrl: String(d.imageUrl || ''),
            badge: d.badge ? String(d.badge) : undefined,
            sortOrder: Number(d.sortOrder || 0),
            active: Boolean(d.active),
          };
        });
        items.sort((a, b) => a.sortOrder - b.sortOrder);
        onData(items);
      }
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export function subscribePublicBanners(
  onData: (banners: BannerSlide[]) => void,
  onError?: (err: unknown) => void
) {
  const q = query(collection(db, 'banners'), where('active', '==', true));
  return onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot.empty) {
        const items: BannerSlide[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: String(d.id || docSnap.id),
            order: Number(d.order || 0),
            title: String(d.title || ''),
            subtitle: String(d.subtitle || ''),
            badge: d.badge ? String(d.badge) : undefined,
            imageUrl: String(d.imageUrl || ''),
            accent: d.accent ? String(d.accent) : undefined,
            active: Boolean(d.active),
          };
        });
        items.sort((a, b) => a.order - b.order);
        onData(items);
      }
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export async function syncSettingsToFirestore(settings: GlobalSettings): Promise<void> {
  if (!auth.currentUser) return;
  const path = 'settings/global';
  try {
    await setDoc(doc(db, 'settings', 'global'), {
      supportGroupUrl: settings.supportGroupUrl.slice(0, 300),
      supportChannelUrl: settings.supportChannelUrl.slice(0, 300),
      bkashNumber: settings.bkashNumber.slice(0, 30),
      nagadNumber: settings.nagadNumber.slice(0, 30),
      minDeposit: Number(settings.minDeposit),
      minWithdraw: Number(settings.minWithdraw),
      welcomeBonus: Number(settings.welcomeBonus),
      level1Rate: Number(settings.level1Rate),
      level2Rate: Number(settings.level2Rate),
      level3Rate: Number(settings.level3Rate),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncPlanToFirestore(plan: Plan): Promise<void> {
  if (!auth.currentUser) return;
  const safeId = plan.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
  const path = `plans/${safeId}`;
  try {
    const payload: Record<string, unknown> = {
      id: safeId,
      name: plan.name.slice(0, 80),
      price: Number(plan.price),
      dailyIncome: Number(plan.dailyIncome),
      totalIncome: Number(plan.totalIncome),
      validityDays: Number(plan.validityDays),
      imageUrl: plan.imageUrl.slice(0, 500),
      sortOrder: Number(plan.sortOrder),
      active: Boolean(plan.active),
      updatedAt: serverTimestamp(),
    };
    if (plan.badge) payload.badge = plan.badge.slice(0, 60);
    await setDoc(doc(db, 'plans', safeId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncBannerToFirestore(banner: BannerSlide): Promise<void> {
  if (!auth.currentUser) return;
  const safeId = banner.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
  const path = `banners/${safeId}`;
  try {
    const payload: Record<string, unknown> = {
      id: safeId,
      order: Number(banner.order),
      title: banner.title.slice(0, 160),
      subtitle: banner.subtitle.slice(0, 320),
      imageUrl: banner.imageUrl.slice(0, 500),
      active: Boolean(banner.active),
      updatedAt: serverTimestamp(),
    };
    if (banner.badge) payload.badge = banner.badge.slice(0, 60);
    if (banner.accent) payload.accent = banner.accent.slice(0, 40);
    await setDoc(doc(db, 'banners', safeId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deletePlanFromFirestore(planId: string): Promise<void> {
  if (!auth.currentUser) return;
  const safeId = planId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
  const path = `plans/${safeId}`;
  try {
    await deleteDoc(doc(db, 'plans', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
