import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatRoomComponent } from './chat-room/chat-room.component';

const routes: Routes = [
	{
		path: 'chat-room',
		component: ChatRoomComponent,
		data: {
			identifier: 'myChatRoomComponent'
		}
	},
	{ path: '', redirectTo: '/chat-room', pathMatch: 'full' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
