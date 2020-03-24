import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import 'firebase/firestore';

import { Message } from './message.model';

@Injectable({
	providedIn: 'root'
})
export class HelperService {

	constructor(private firestore: AngularFirestore) { }

	getMessages() {
		return this.firestore.collection('messages').valueChanges();
	}

	createMessage(message: Message) {
		return this.firestore.collection('messages').add(message);
	}

	updateMessage(message: Message) {
		delete message.id;
		this.firestore.doc('messages/' + message.id).update(message);
	}

	deleteMessage(messageId: string) {
		this.firestore.doc('messages/' + messageId).delete();
	}

	generateId(idLength: number = 16) {
		let identifier: string = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		var charactersLength = characters.length;
		for (var i = 0; i < idLength; i++) {
			identifier += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return identifier;
	}

}
