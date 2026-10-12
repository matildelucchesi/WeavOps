import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Certification } from '../api/model/certification';
@Injectable({providedIn: 'root'})
export class CertificationFacadeService {
  private readonly http = inject(HttpClient);
  getAll() { return this.http.get<Certification[]>('/api/certifications'); }
  create(certification: Certification) { return this.http.post<Certification>('/api/certifications', certification); }
}
