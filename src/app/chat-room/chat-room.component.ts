import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import * as firebase from 'firebase/app';

import { Message } from '../message.model';
import { HelperService } from '../helper.service';
import { Room } from '../room.model';
import { User } from '../user.model';
import { Observable } from 'rxjs';

@Component({
	selector: 'app-chat-room',
	encapsulation: ViewEncapsulation.None,
	templateUrl: './chat-room.component.html',
	styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit, AfterViewInit {

	chatNames = ['arka', 'piya', 'dog', 'cat', 'mosquito', 'ghost'];
	chatData: Message[];
	myForm: FormGroup;
	joinRoomModal: boolean = false;
	isJoiningRoom: boolean = false;
	roomID: any = '';
	userID: any = '';
	roomName: string = '';
	userName: string = '';
	isJoinPrivateRoom: boolean = false;
	openRoomName: string = 'open-room';

	@ViewChild('mentions', { static: true }) mentionChild: any;
	@ViewChild('myInput', { static: true }) inputChild: ElementRef;
	@ViewChild('userNameInput', { static: true }) userNameChild: ElementRef;

	get mention(): AbstractControl {
		return this.myForm.get('mention')!;
	}

	get timestamp() {
		return firebase.firestore.FieldValue.serverTimestamp();
	}

	constructor(private fb: FormBuilder, private _helper: HelperService) { }

	start() {
		if (this.isJoiningRoom) return;
		if (this.userName == '' || this.userName == undefined) {
			this._helper.notify('People want to know you and need a name to remember you!', 'error');
		}
		else if (this.isJoinPrivateRoom && (this.roomName == '' || this.roomName == undefined)) {
			this._helper.notify('Don\'t you have any room name? Try this one: <strong>open-room</strong>!', 'warning');
		}
		else {
			this.isJoiningRoom = true;
			let user: User = {
				id: this._helper.generateHash(),
				name: this.userName + '_' + this._helper.generateHash(3, true),
				info: {},
				created: this.timestamp,
				updated: null
			};

			this._helper.findUser(this.userName).subscribe(
				users => {
					if (users.length) {
						let user: any = users[0];
						this.userID = user['id'];
						sessionStorage.setItem('userID', this.userID);
						user.id = this.userID;
						this._helper.updateUser(user);
						if (this.isJoinPrivateRoom) {
							this.joinByRoomName(this.roomName);
						}
						else {
							this.joinByRoomName(this.openRoomName);
						}
						this.isJoiningRoom = false;
						this.joinRoomModal = false;
					}
					else {
						this._helper.createUser(user).then(
							docRef => {
								// console.log('user docRef', docRef);
								this.userName = user.name;
								this.userID = docRef['id'];
								sessionStorage.setItem('userID', this.userID);
								user.id = this.userID;
								this._helper.updateUser(user);
								if (this.isJoinPrivateRoom) {
									this.joinByRoomName(this.roomName);
								}
								else {
									this.joinByRoomName(this.openRoomName);
								}
								this.isJoiningRoom = false;
								this.joinRoomModal = false;
							}
						)
					}
				}
			)
		}
	}

	createRoom(roomName: string) {
		this.isJoiningRoom = true;
		let room: Room = {
			id: this._helper.generateHash(),
			name: roomName,
			info: {},
			created: this.timestamp,
			updated: null
		};
		this._helper.createRoom(room).then(
			docRef => {
				// console.log('room docRef', docRef);
				this.roomID = docRef['id'];
				sessionStorage.setItem('roomID', this.roomID);
				room.id = this.roomID;
				this._helper.updateRoom(room);
				this.isJoiningRoom = false;
			}
		);
	}

	whereTo() {
		this.joinRoomModal = true;
		setTimeout(() => {
			this.userNameChild.nativeElement.focus();
		}, 1000);
	}

	noWhere() {
		this.joinRoomModal = false;
		setTimeout(() => {
			this.inputChild.nativeElement.focus();
		}, 1000);
	}

	mentionValidator = (control: FormControl): { [s: string]: boolean } => {
		if (!control.value) {
			return { required: true };
		}
		// else if (this.mentionChild.getMentions().length > 10) {
		// 	return { confirm: true, error: true };
		// }
		return {};
	};

	sendMessage(): void {
		this.mention.markAsDirty();
		this.mention.updateValueAndValidity();
		if (this.mention.valid) {
			// console.log('Submit!!!', this.mention.value);
			// console.log(this.mentionChild.getMentions());
			let message: Message = {
				id: this._helper.generateHash(),
				userId: this.userID,
				name: this.userName,
				message: this.mention.value,
				info: {},
				created: this.timestamp,
				updated: null
			};
			this.create(message);
			this.resetForm();
		} else {
			console.log('Errors are there!!!');
		}
	}

	resetForm(): void {
		let mentions: any = this.mentionChild.getMentions();
		if (mentions.length) {
			mentions = mentions.join(' ');
		}
		this.myForm.reset({
			mention: mentions
		});
		this.inputChild.nativeElement.focus();
	}

	create(message: Message) {
		this._helper.sendMessage(message, this.roomID).then(
			docRef => {
				// console.log('room docRef', docRef);
				let messageID: string = docRef['id'];
				message.id = messageID;
				this._helper.updateMessage(message, this.roomID);
			}
		);
	}

	update(message: Message) {
		this._helper.updateMessage(message, this.roomID);
	}

	delete(messageID: string) {
		this._helper.deleteMessage(messageID, this.roomID);
	}

	messages() {
		this._helper.getMessages(this.roomID).subscribe(data => {
			// console.log('getMessages', data);
			if (document.querySelector(".ant-list-items") != null) {
				document.querySelector(".ant-list-items").scrollTop = document.querySelector(".ant-list-items").scrollHeight;
			}
			this.chatData = data.map(e => {
				return {
					id: e['id'],
					name: e['name'],
					message: e['message'],
					info: e['info']
					// ...e.payload.doc.data()
				} as Message;
			})
		});
	}

	existing() {
		let tempUserID: string = sessionStorage.getItem('userID');
		if (tempUserID != undefined && tempUserID != null && tempUserID != '') {
			this.userID = tempUserID;
			this.user().subscribe(
				details => {
					if (details) {
						this.userName = details.name;
						let tempRoomID: string = sessionStorage.getItem('roomID');
						if (tempRoomID != undefined && tempRoomID != null && tempRoomID != '') {
							this.findAndJoin({ roomID: tempRoomID });
						}
					}
					else {
						this.restart();
					}
				}
			)
		}
		else {
			this.restart();
		}
	}

	findAndJoin({ roomName, roomID }: { roomName?: string, roomID?: string }) {
		if (typeof roomName != 'undefined' && typeof roomID != 'undefined') {
			if (typeof roomID != 'undefined' && roomID != null) {
				this.isJoiningRoom = true;
				this.room(roomID).subscribe(
					details => {
						if (details) {
							this.roomName = details.name;
							this.isJoiningRoom = false;
							this.messages();
						}
						else {
							this.restart();
						}
					}
				)
			}
			else if (typeof roomName != 'undefined' && roomName != null) {
				this.joinByRoomName(roomName);
			}
			else this.joinByRoomName(this.openRoomName);
		}
		else this.joinByRoomName(this.openRoomName);
	}

	joinByRoomName(roomName: string) {
		if (this.userID != '' && this.userID != undefined) {
			this.isJoiningRoom = true;
			this._helper.findRoom(roomName).subscribe(
				rooms => {
					if (rooms.length) {
						let room: any = rooms[0];
						this.roomID = room.id;
						sessionStorage.setItem('roomID', this.roomID);
						this.roomName = room.name;
						this.messages();
						this.isJoiningRoom = false;
					}
					else if (roomName != this.openRoomName) {
						this._helper.notify(`Cannot find <strong>${roomName}</strong>. Joining ${this.openRoomName}.`, 'warning');
						this.joinByRoomName(this.openRoomName);
					}
					else {
						this._helper.notify(`Cannot find <strong>${roomName}</strong>. You can try again later.`, 'warning');
						this.isJoiningRoom = false;
					}
				},
				error => console.log('error', error)
			)
		}
	}

	restart() {
		this.userID = '';
		this.roomID = '';
		sessionStorage.removeItem('userID');
		sessionStorage.removeItem('roomID');
		this.whereTo();
	}

	user(userID: string = this.userID): Observable<any> {
		return this._helper.getUser(userID).pipe(
			map(
				user => {
					if (user.exists) {
						return user.data();
					}
					return false;
				},
				error => {
					console.log('error', error);
					return false;
				}
			)
		)
	}

	room(roomID: string = this.roomID): Observable<any> {
		return this._helper.getUser(roomID).pipe(
			map(
				room => {
					if (room.exists) {
						return room.data();
					}
					return false;
				},
				error => {
					console.log('error', error);
					return false;
				}
			)
		)
	}

	ngOnInit(): void {
		this.myForm = this.fb.group({
			mention: [null, [Validators.required, this.mentionValidator]]
		});
		this.existing();
		this.joinByRoomName(this.openRoomName);
	}

	ngAfterViewInit() {
		this.inputChild.nativeElement.focus();
	}

	@HostListener('window:keyup.enter', ['$event'])
	keyEvent(event: KeyboardEvent) {
		// console.log('keyEvent event', event);
		if (event.key.toLowerCase() == 'enter') {
			if (this.joinRoomModal) {
				this.start();
			}
		}
	}

}
