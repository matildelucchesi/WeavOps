import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Destination } from '../api/model/destination';

@Injectable({providedIn: 'root'})
export class DestinationFacadeService {
  private readonly http = inject(HttpClient);
  getAll() { return this.http.get<Destination[]>('/api/destinations'); }
  create(destination: Destination) { return this.http.post<Destination>('/api/destinations', destination); }
  update(id: string, destination: Destination) { return this.http.put<Destination>(`/api/destinations/${encodeURIComponent(id)}`, destination); }
  remove(id: string) { return this.http.delete<void>(`/api/destinations/${encodeURIComponent(id)}`); }
}
