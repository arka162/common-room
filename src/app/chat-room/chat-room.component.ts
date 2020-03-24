import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Message } from '../message.model';
import { HelperService } from '../helper.service';
import { Room } from '../room.model';
import { User } from '../user.model';

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

	@ViewChild('mentions', { static: true }) mentionChild: any;
	@ViewChild('myInput', { static: true }) inputChild: ElementRef;

	get mention(): AbstractControl {
		return this.myForm.get('mention')!;
	}

	constructor(private fb: FormBuilder, private _helper: HelperService) { }

	joinRoom() {
		if (this.userName == '' || this.userName == undefined) {
			this._helper.notify('People want to know you and need a name to remember you!', 'error');
		}
		else if (this.isJoinPrivateRoom && (this.roomName == '' || this.roomName == undefined)) {
			this._helper.notify('Don\'t you have any room name? Try this one: <strong>open-room</strong>!', 'warning');
		}
		else {
			let user: User = {
				id: this._helper.generateId(),
				name: this.userName,
				info: {}
			};
			this.userID = this._helper.createUser(user);
			this._helper.createUser(user).then(
				docRef => {
					console.log('user docRef', docRef);
				}
			)
			if (this.isJoinPrivateRoom) {
				let room: Room = {
					id: this._helper.generateId(),
					name: this.roomName,
					info: {}
				};
				this._helper.createRoom(room);
			}
		}
	}

	whereTo() {
		this.joinRoomModal = true;
	}

	noWhere() {
		this.joinRoomModal = false;
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
				id: this._helper.generateId(),
				userId: this.userID,
				name: 'admin',
				message: this.mention.value,
				info: {}
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
		this._helper.sendMessage(message);
	}

	update(message: Message) {
		this._helper.updateMessage(message);
	}

	delete(id: string) {
		this._helper.deleteMessage(id);
	}

	get() {
		this._helper.getMessages().subscribe(data => {
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

	ngOnInit(): void {
		this.myForm = this.fb.group({
			mention: [null, [Validators.required, this.mentionValidator]]
		});
	}

	ngAfterViewInit() {
		this.inputChild.nativeElement.focus();
		this.get();
	}

}
