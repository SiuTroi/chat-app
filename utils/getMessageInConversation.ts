import { collection, DocumentData, orderBy, query, QueryDocumentSnapshot, Timestamp, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { IMessage } from "../type";

export const generateQueryGetMessage = (conversationId?: string) =>
  query(
    collection(db, "messages"),
    where("conversation_id", "==", conversationId),
    orderBy("sent_at", "asc")
  );

  export const transformMessage = (message: QueryDocumentSnapshot<DocumentData>) => ({
    id: message.id,
    ...message.data(), // spread out conversation_id, text, sent_at, user
    sent_at: message.data().sent_at ? convertFirestoreTimeStamToString((message.data().sent_at as Timestamp)) : null
  }) as IMessage

  export const convertFirestoreTimeStamToString = (timestamp: Timestamp) => new Date(timestamp.toDate().getTime()).toLocaleString()