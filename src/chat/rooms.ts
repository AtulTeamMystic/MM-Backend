import * as admin from "firebase-admin";

export const roomsCollection = () => admin.firestore().collection("Rooms");
export const roomRef = (roomId: string) => roomsCollection().doc(roomId);
