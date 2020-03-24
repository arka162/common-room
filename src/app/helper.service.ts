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

	getUsers() {
		return this.firestore.collection('common-room/users/members').valueChanges();
	}

	createUser(user: User) {
		return this.firestore.collection('common-room/users/members').add(user).then(docRef => {
			return docRef;
		}).catch(error => console.error("Error adding document: ", error));
	}

	updateUser(user: User) {
		delete user.id;
		this.firestore.doc('common-room/users/members/' + user.id).update(user);
	}

	deleteUser(userId: string) {
		this.firestore.doc('users/members/' + userId).delete();
	}

	getRooms() {
		return this.firestore.collection('common-room/rooms').valueChanges();
	}

	createRoom(room: Room) {
		return this.firestore.collection('common-room/rooms').add(room);
	}

	updateRoom(room: Room) {
		delete room.id;
		this.firestore.doc('common-room/rooms/' + room.id).update(room);
	}

	deleteRoom(roomId: string) {
		this.firestore.doc('messages/' + roomId).delete();
	}

	getMessages() {
		return this.firestore.collection('messages').valueChanges();
	}

	sendMessage(message: Message) {
		return this.firestore.collection('messages').add(message);
	}

	updateMessage(message: Message) {
		delete message.id;
		this.firestore.doc('messages/' + message.id).update(message);
	}

	deleteMessage(messageId: string) {
		this.firestore.doc('messages/' + messageId).delete();
	}

	generateId(idLength: number = 16, onlyNumbers: boolean = false) {
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
