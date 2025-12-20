import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {

  info: { email?: string; name?: string; role?: string } = {};

  constructor(public api: ApiService) {}

  ngOnInit(): void {
    this.info = this.api.getUserFromToken();
  }
}
