import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Message } from '../message.model';
import { HelperService } from '../helper.service';

@Component({
	selector: 'app-chat-room',
	encapsulation: ViewEncapsulation.None,
	templateUrl: './chat-room.component.html',
	styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit {

	chatNames = ['arka', 'piya', 'dog', 'cat', 'mosquito', 'ghost'];
	// chatData: Array<any> = [
	// 	{
	// 		name: 'arka',
	// 		message: 'Racing car sprays burning fuel into crowd.',
	// 		data: {}
	// 	},
	// 	{
	// 		name: 'piya',
	// 		message: 'Japanese princess to wed commoner.',
	// 		data: {}
	// 	},
	// 	{
	// 		name: 'dog',
	// 		message: 'Australian walks 100km after outback crash.',
	// 		data: {}
	// 	},
	// 	{
	// 		name: 'cat',
	// 		message: 'Man charged over missing wedding girl.',
	// 		data: {}
	// 	},
	// 	{
	// 		name: 'mosquito',
	// 		message: 'Los Angeles battles huge wildfires.',
	// 		data: {}
	// 	}
	// ];
	chatData: Message[];
	myForm: FormGroup;

	@ViewChild('mentions', { static: true }) mentionChild: any;

	get mention(): AbstractControl {
		return this.myForm.get('mention')!;
	}

	constructor(private fb: FormBuilder, private _helper: HelperService) { }

	mentionValidator = (control: FormControl): { [s: string]: boolean } => {
		if (!control.value) {
			return { required: true };
		} else if (this.mentionChild.getMentions().length > 10) {
			return { confirm: true, error: true };
		}
		return {};
	};

	submitForm(): void {
		this.mention.markAsDirty();
		this.mention.updateValueAndValidity();
		if (this.mention.valid) {
			// console.log('Submit!!!', this.mention.value);
			// console.log(this.mentionChild.getMentions());
			let message: Message = {
				id: this._helper.generateId(),
				name: 'admin',
				message: this.mention.value,
				info: {}
			};
			this.create(message);
		} else {
			console.log('Errors in form!!!');
		}
	}

	resetForm(): void {
		this.myForm.reset({
			mention: null
		});
	}

	create(message: Message) {
		this._helper.createMessage(message);
	}

	update(message: Message) {
		this._helper.updateMessage(message);
	}

	delete(id: string) {
		this._helper.deleteMessage(id);
	}

	ngOnInit(): void {
		this.myForm = this.fb.group({
			mention: [null, [Validators.required, this.mentionValidator]]
		});
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

}
