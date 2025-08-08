
import { db } from '@/lib/firebase';
import { Task } from '@/lib/types';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  getDoc
} from 'firebase/firestore';

// Note: We are creating a new type here that is slightly different from the Task type in types.ts
// This is because Firestore returns timestamps as a different type than what we expect on the client.
// We will convert these timestamps to ISO strings before passing them to the client.
export interface FirestoreTask extends Omit<Task, 'dueDate' | 'completed_at' | 'createdAt'> {
    uid: string;
    createdAt: Timestamp;
    dueDate?: Timestamp;
    completed_at?: Timestamp;
}

const mapFirestoreDocToTask = (doc: any): Task => {
    const data = doc.data();
    return {
        ...(data as Omit<Task, 'id'>),
        id: doc.id,
        dueDate: data.dueDate?.toDate().toISOString(),
        completed_at: data.completed_at?.toDate().toISOString(),
        createdAt: data.createdAt?.toDate().toISOString(),
    };
};

export const addTaskForUser = async (uid: string, taskData: Omit<Task, 'id' | 'status' | 'createdAt'>): Promise<Task> => {
  const tasksCollection = collection(db, 'tasks');
  
  let dueDate: Date | undefined = undefined;
  if (taskData.dueDate) {
    const parsedDate = new Date(taskData.dueDate);
    if (!isNaN(parsedDate.getTime())) {
      dueDate = parsedDate;
    } else {
      console.warn('Invalid date format received from AI for dueDate:', taskData.dueDate);
    }
  }
  
  const docData: { [key: string]: any } = {
    ...taskData,
    uid,
    status: 'pending',
    createdAt: serverTimestamp(),
    dueDate: dueDate,
  };

  // Remove undefined fields so Firestore doesn't complain
  Object.keys(docData).forEach(key => docData[key as keyof typeof docData] === undefined && delete docData[key as keyof typeof docData]);

  const docRef = await addDoc(tasksCollection, docData);
  const newTaskDoc = await getDoc(docRef);
  return mapFirestoreDocToTask(newTaskDoc);
};

export const getTasksForUser = async (uid: string): Promise<Task[]> => {
  const tasksCollection = collection(db, 'tasks');
  const q = query(tasksCollection, where('uid', '==', uid));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(mapFirestoreDocToTask);
};

export const getTaskByIdOrTitle = async (uid: string, { id, title }: { id?: string | null, title?: string | null }): Promise<Task | null> => {
    const tasksCollection = collection(db, 'tasks');
    if (id) {
        const taskDoc = await getDoc(doc(tasksCollection, id));
        if (taskDoc.exists() && taskDoc.data().uid === uid) {
            return mapFirestoreDocToTask(taskDoc);
        }
    }

    if (title) {
        const q = query(tasksCollection, where('uid', '==', uid), where('title', '==', title));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            // Return the first match
            return mapFirestoreDocToTask(querySnapshot.docs[0]);
        }
    }

    return null;
}


export const updateTaskForUser = async (taskId: string, updates: Partial<Task>) => {
  const taskDoc = doc(db, 'tasks', taskId);
  const firestoreUpdates: Partial<FirestoreTask & { [key: string]: any }> = { ...updates };
  
  if (updates.dueDate) {
    firestoreUpdates.dueDate = Timestamp.fromDate(new Date(updates.dueDate));
  }
  if (updates.completed_at) {
    firestoreUpdates.completed_at = Timestamp.fromDate(new Date(updates.completed_at));
  } else if (updates.status === 'pending') {
    firestoreUpdates.completed_at = undefined;
  }

  // Remove id and createdAt from updates object before sending to Firestore
  if (firestoreUpdates.id) {
    delete firestoreUpdates.id;
  }
  if (firestoreUpdates.createdAt) {
    delete firestoreUpdates.createdAt;
  }

  await updateDoc(taskDoc, firestoreUpdates);
};


export const deleteTaskForUser = async (taskId: string) => {
  const taskDoc = doc(db, 'tasks', taskId);
  await deleteDoc(taskDoc);
};
