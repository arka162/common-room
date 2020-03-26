import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import 'firebase/firestore';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Message } from './message.model';
import { Room } from './room.model';
import { User } from './user.model';

@Injectable({
	providedIn: 'root'
})
export class HelperService {

	constructor(private firestore: AngularFirestore, private _message: NzMessageService) { }

	notify(message: string, type: string = 'success'): void {
		this._message.create(type, message);
	}

	findUser(userName: string) {
		return this.firestore.collection('common-room/users/members', ref => ref.where('name', '==', userName).limit(1)).valueChanges();
	}

	getUser(userID: string) {
		return this.firestore.collection('common-room/users/members').doc(userID).get();
	}

	getUsers() {
		return this.firestore.collection('common-room/users/members').valueChanges();
	}

	createUser(user: User) {
		return this.firestore.collection('common-room/users/members').add(user).then(docRef => {
			return docRef;
		}).catch(error => console.error("Error adding document: ", error));
	}

	updateUser(user: User) {
		// delete user.id;
		this.firestore.doc(`common-room/users/members/${user.id}`).update(user);
	}

	deleteUser(userID: string) {
		this.firestore.doc(`common-room/users/members/${userID}`).delete();
	}

	findRoom(roomName: string) {
		return this.firestore.collection('common-room/rooms/public', ref => ref.where('name', '==', roomName).limit(1)).valueChanges();
	}

	getRoom(roomID: string) {
		return this.firestore.collection('common-room/rooms/public').doc(roomID).get();
	}

	getRooms() {
		return this.firestore.collection('common-room/rooms/public').valueChanges();
	}

	createRoom(room: Room) {
		return this.firestore.collection('common-room/rooms/public').add(room).then(docRef => {
			return docRef;
		}).catch(error => console.error("Error adding document: ", error));
	}

	updateRoom(room: Room) {
		// delete room.id;
		this.firestore.doc(`common-room/rooms/public/${room.id}`).update(room);
	}

	deleteRoom(roomID: string) {
		this.firestore.doc(`common-room/rooms/public/${roomID}`).delete();
	}

	getMessages(roomID: string) {
		return this.firestore.collection(`common-room/rooms/public/${roomID}/messages`, ref =>
			ref.orderBy('created', 'asc')).valueChanges();
	}

	sendMessage(message: Message, roomID: string) {
		// let temp: any = message;
		// message['created'] = this.timestamp;
		return this.firestore.collection(`common-room/rooms/public/${roomID}/messages`).add(message).then(docRef => {
			return docRef;
		}).catch(error => console.error("Error adding document: ", error));
	}

	updateMessage(message: Message, roomID: string) {
		// delete message.id;
		this.firestore.doc(`common-room/rooms/public/${roomID}/messages/${message.id}`).update(message);
	}

	deleteMessage(messageID: string, roomID: string) {
		this.firestore.doc(`common-room/rooms/public/${roomID}/messages/${messageID}`).delete();
	}

	generateHash(idLength: number = 16, onlyNumbers: boolean = false) {
		let identifier: string = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		if (onlyNumbers) {
			characters = '0123456789';
		}
		var charactersLength = characters.length;
		for (var i = 0; i < idLength; i++) {
			identifier += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return identifier;
	}

}
