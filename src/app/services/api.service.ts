import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Hadith } from '../models/hadith.model';
import { Zikr } from '../models/zikr.model';
import { Reflection } from '../models/reflection.model';
import { Memorial } from '../models/memorial.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000/api';

  // Stats & Seed
  getStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stats`);
  }

  seedData(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/stats/seed`, {});
  }

  // Hadiths
  getHadiths(topic?: string, grading?: string, search?: string, page: number = 1, limit: number = 50): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (topic && topic !== 'الكل') params = params.set('topic', topic);
    if (grading && grading !== 'الكل') params = params.set('grading', grading);
    if (search && search.trim()) params = params.set('search', search.trim());
    return this.http.get<any>(`${this.baseUrl}/hadiths`, { params });
  }

  createHadith(hadith: Partial<Hadith>): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/hadiths`, hadith);
  }

  updateHadith(id: string, hadith: Partial<Hadith>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/hadiths/${id}`, hadith);
  }

  deleteHadith(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/hadiths/${id}`);
  }

  // Azkar
  getAzkar(category?: string): Observable<{ success: boolean; data: Zikr[] }> {
    let params = new HttpParams();
    if (category && category !== 'الكل') params = params.set('category', category);
    return this.http.get<{ success: boolean; data: Zikr[] }>(`${this.baseUrl}/azkar`, { params });
  }

  createZikr(zikr: Partial<Zikr>): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/azkar`, zikr);
  }

  updateZikr(id: string, zikr: Partial<Zikr>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/azkar/${id}`, zikr);
  }

  deleteZikr(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/azkar/${id}`);
  }

  // Reflections
  getReflections(category?: string): Observable<{ success: boolean; data: Reflection[] }> {
    let params = new HttpParams();
    if (category && category !== 'الكل') params = params.set('category', category);
    return this.http.get<{ success: boolean; data: Reflection[] }>(`${this.baseUrl}/reflections`, { params });
  }

  createReflection(reflection: Partial<Reflection>): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reflections`, reflection);
  }

  updateReflection(id: string, reflection: Partial<Reflection>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/reflections/${id}`, reflection);
  }

  deleteReflection(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/reflections/${id}`);
  }

  // Memorial
  getMemorial(): Observable<{ success: boolean; data: Memorial }> {
    return this.http.get<{ success: boolean; data: Memorial }>(`${this.baseUrl}/memorial`);
  }

  updateMemorial(memorial: Partial<Memorial>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/memorial`, memorial);
  }

  // Visitor Activity Tracking & Analytics
  getActivityStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/activity/stats`);
  }

  getRecentActivities(action?: string, visitorId?: string, page: number = 1, limit: number = 50): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (action && action !== 'ALL') {
      params = params.set('action', action);
    }
    if (visitorId && visitorId.trim()) {
      params = params.set('visitorId', visitorId.trim());
    }
    return this.http.get<any>(`${this.baseUrl}/activity/recent`, { params });
  }

  clearActivities(): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/activity/clear`);
  }
}

