import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './services/api.service';
import { Hadith } from './models/hadith.model';
import { Zikr } from './models/zikr.model';
import { Reflection } from './models/reflection.model';
import { Memorial } from './models/memorial.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- ==================== SECURITY LOCK SCREEN ==================== -->
    @if (!isAuthenticated) {
      <div class="lock-screen-wrapper">
        <div class="lock-card card-glass">
          <div class="lock-top-bar">
            <!-- Theme Toggle Button -->
            <button type="button" class="btn-ghost theme-btn" (click)="toggleTheme()" [title]="isLight ? 'تفعيل الوضع الليلي' : 'تفعيل الوضع النهاري'">
              <i class="fa-solid" [class.fa-sun]="!isLight" [class.fa-moon]="isLight"></i>
              <span class="theme-label-sm">{{ isLight ? 'ليلي' : 'نهاري' }}</span>
            </button>
          </div>

          <div class="lock-icon-wrap">
            <i class="fa-solid fa-shield-halved"></i>
          </div>
          <span class="badge badge-gold">منطقة إدارية محمية</span>
          <h1 class="lock-title">لوحة التحكم المستقلة</h1>
          <p class="lock-sub">
            هذه اللوحة مخصصة لإدارة محتوى الموقع والصدقة الجارية على روح الجدة رحمها الله. يرجى إدخال رمز المرور الإداري للمتابعة.
          </p>

          <form (ngSubmit)="unlockDashboard()" class="lock-form">
            <div class="pin-input-wrap">
              <i class="fa-solid fa-key pin-icon"></i>
              <input
                type="password"
                [(ngModel)]="enteredPin"
                name="adminPin"
                placeholder="أدخل رمز المرور (الافتراضي: 123456)"
                class="pin-input"
                autofocus
              />
            </div>

            @if (loginError) {
              <div class="pin-error-msg">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>{{ loginError }}</span>
              </div>
            }

            <button type="submit" class="btn-primary btn-unlock">
              <i class="fa-solid fa-lock-open"></i>
              <span>تسجيل الدخول والتحكم</span>
            </button>
          </form>

          <div class="lock-footer-info">
            <span>منصة نور وهُدى • تحكم مباشر بقاعدة بيانات MongoDB Atlas</span>
          </div>
        </div>
      </div>
    } @else {
      <!-- ==================== MAIN DASHBOARD (CONTAINER) ==================== -->
      <div class="dashboard-wrapper container">
        <!-- Dashboard Top Header -->
        <header class="dash-header">
          <div class="dash-title-wrap">
            <div class="dash-brand-row">
              <span class="badge badge-emerald"><i class="fa-solid fa-shield-check"></i> لوحة تحكم مستقلة ومحمية</span>
              <span class="port-indicator">المنفذ: 4201 • متصلة بالباك اند وقاعدة البيانات</span>
              <span class="auth-user-badge"><i class="fa-solid fa-user-check"></i> جلسة الإدارة: نشطة (المسؤول)</span>
            </div>
            <h1 class="dash-title">إدارة محتوى منصة نور وهُدى والصدقة الجارية</h1>
            <p class="dash-subtitle">
              لوحة إدارة منفصلة وخاصة لتعديل بيانات الموقع الرئيسي (الأحاديث، الأذكار، المواعظ، وإهداء الجدة) مباشرة في MongoDB.
            </p>
          </div>

          <div class="dash-actions">
            <!-- Theme Toggle -->
            <button class="btn-ghost theme-btn" (click)="toggleTheme()" [title]="isLight ? 'تفعيل الوضع الليلي' : 'تفعيل الوضع النهاري'">
              <i class="fa-solid" [class.fa-sun]="!isLight" [class.fa-moon]="isLight"></i>
              <span>{{ isLight ? 'الوضع الليلي' : 'الوضع النهاري' }}</span>
            </button>
            <button class="btn-ghost" (click)="triggerSeedData()" title="استعادة أو تهيئة المحتوى المعتمد">
              <i class="fa-solid fa-database"></i>
              <span>تهيئة البيانات المعتمدة</span>
            </button>
            <a href="http://localhost:4200" target="_blank" class="btn-primary">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
              <span>معاينة الموقع (4200)</span>
            </a>
            <button class="btn-danger" (click)="logout()" title="قفل لوحة التحكم">
              <i class="fa-solid fa-right-from-bracket"></i>
              <span>قفل وخروج</span>
            </button>
          </div>
        </header>

        <!-- Stats Overview Cards -->
        <div class="stats-overview-grid">
          <div class="stat-card card-glass">
            <div class="stat-icon-circle emerald"><i class="fa-solid fa-scroll"></i></div>
            <div class="stat-info">
              <span class="stat-number">{{ stats?.hadiths || 0 }}</span>
              <span class="stat-name">الأحاديث النبوية الموثقة</span>
            </div>
          </div>

          <div class="stat-card card-glass">
            <div class="stat-icon-circle blue"><i class="fa-solid fa-hands-praying"></i></div>
            <div class="stat-info">
              <span class="stat-number">{{ stats?.azkar || 0 }}</span>
              <span class="stat-name">الأذكار وحصن المسلم</span>
            </div>
          </div>

          <div class="stat-card card-glass">
            <div class="stat-icon-circle purple"><i class="fa-solid fa-heart-pulse"></i></div>
            <div class="stat-info">
              <span class="stat-number">{{ stats?.reflections || 0 }}</span>
              <span class="stat-name">المواعظ والرقائق</span>
            </div>
          </div>

          <div class="stat-card card-glass">
            <div class="stat-icon-circle gold"><i class="fa-solid fa-dove"></i></div>
            <div class="stat-info">
              <span class="stat-number">{{ stats?.prayers || 0 }}</span>
              <span class="stat-name">دعاء مُهدى للجدة</span>
            </div>
          </div>
        </div>

        <!-- Main Management Tabs -->
        <div class="dash-tabs-bar">
          <button class="dash-tab-btn" [class.active]="activeTab === 'hadiths'" (click)="activeTab = 'hadiths'">
            <i class="fa-solid fa-scroll"></i> إدارة الأحاديث ({{ hadiths.length }})
          </button>
          <button class="dash-tab-btn" [class.active]="activeTab === 'azkar'" (click)="activeTab = 'azkar'">
            <i class="fa-solid fa-hands-praying"></i> إدارة الأذكار ({{ azkar.length }})
          </button>
          <button class="dash-tab-btn" [class.active]="activeTab === 'reflections'" (click)="activeTab = 'reflections'">
            <i class="fa-solid fa-feather-pointed"></i> إدارة المواعظ ({{ reflections.length }})
          </button>
          <button class="dash-tab-btn" [class.active]="activeTab === 'memorial'" (click)="activeTab = 'memorial'">
            <i class="fa-solid fa-gear"></i> إعدادات الصدقة الجارية وإهداء الجدة
          </button>
          <button class="dash-tab-btn highlight-tab" [class.active]="activeTab === 'activity'" (click)="switchTabToActivity()">
            <i class="fa-solid fa-chart-line"></i> سجل وتفاعل الزوار والعداد ({{ activityStats?.totalActivities || 0 }})
          </button>
        </div>

        <!-- ==================== TAB 1: HADITHS ==================== -->
        @if (activeTab === 'hadiths') {
          <div class="tab-content card-glass">
            <div class="tab-header-row">
              <div>
                <h2 class="tab-title">قائمة الأحاديث النبوية الموثقة</h2>
                <span class="tab-sub">تعديل أو إضافة أي حديث نبوي ليعرض فوراً على الزوار في الموقع الرئيسي</span>
              </div>
              <button class="btn-primary" (click)="openHadithModal()">
                <i class="fa-solid fa-plus"></i> إضافة حديث نبوي جديد
              </button>
            </div>

            <div class="table-responsive">
              <table class="dash-table">
                <thead>
                  <tr>
                    <th style="width: 20%;">العنوان والتصنيف</th>
                    <th style="width: 40%;">نص الحديث الشريف</th>
                    <th style="width: 15%;">الراوي الصحابي</th>
                    <th style="width: 15%;">الحكم والمصدر</th>
                    <th style="width: 10%;">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  @for (h of hadiths; track h._id) {
                    <tr>
                      <td>
                        <span class="table-title">{{ h.title || h.topic }}</span>
                        <span class="badge badge-purple table-badge">{{ h.topic }}</span>
                      </td>
                      <td>
                        <p class="table-text-preview font-hadith">{{ h.text }}</p>
                      </td>
                      <td>{{ h.narrator || '—' }}</td>
                      <td>
                        <span class="badge badge-emerald">{{ h.grading }}</span>
                        <small class="d-block text-muted" style="margin-top: 4px;">{{ h.source }} ({{ h.hadithNumber }})</small>
                      </td>
                      <td>
                        <div class="row-actions">
                          <button class="btn-table-action edit" (click)="editHadith(h)" title="تعديل الحديث">
                            <i class="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button class="btn-table-action delete" (click)="deleteHadith(h)" title="حذف الحديث">
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- ==================== TAB 2: AZKAR ==================== -->
        @if (activeTab === 'azkar') {
          <div class="tab-content card-glass">
            <div class="tab-header-row">
              <div>
                <h2 class="tab-title">قائمة أذكار المسلم والأدعية</h2>
                <span class="tab-sub">إجمالي: {{ azkar.length }} ذكر مع التكرار والفضل</span>
              </div>
              <button class="btn-primary" (click)="openZikrModal()">
                <i class="fa-solid fa-plus"></i> إضافة ذكر جديد
              </button>
            </div>

            <div class="table-responsive">
              <table class="dash-table">
                <thead>
                  <tr>
                    <th style="width: 15%;">القسم</th>
                    <th style="width: 45%;">نص الذكر</th>
                    <th style="width: 10%;">عدد التكرار</th>
                    <th style="width: 20%;">الفضل والمرجع</th>
                    <th style="width: 10%;">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  @for (z of azkar; track z._id) {
                    <tr>
                      <td><span class="badge badge-blue">{{ z.category }}</span></td>
                      <td><p class="table-text-preview font-hadith">{{ z.text }}</p></td>
                      <td><strong class="count-strong">{{ z.count }} مرات</strong></td>
                      <td>
                        <small>{{ z.benefit || '—' }}</small>
                        <span class="text-muted d-block">{{ z.reference }}</span>
                      </td>
                      <td>
                        <div class="row-actions">
                          <button class="btn-table-action edit" (click)="editZikr(z)" title="تعديل">
                            <i class="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button class="btn-table-action delete" (click)="deleteZikr(z)" title="حذف">
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- ==================== TAB 3: REFLECTIONS ==================== -->
        @if (activeTab === 'reflections') {
          <div class="tab-content card-glass">
            <div class="tab-header-row">
              <div>
                <h2 class="tab-title">قائمة الرقائق والمواعظ</h2>
                <span class="tab-sub">إجمالي: {{ reflections.length }} موعظة من أقوال السلف والصالحين</span>
              </div>
              <button class="btn-primary" (click)="openReflectionModal()">
                <i class="fa-solid fa-plus"></i> إضافة موعظة جديدة
              </button>
            </div>

            <div class="table-responsive">
              <table class="dash-table">
                <thead>
                  <tr>
                    <th style="width: 50%;">المقولة / الموعظة</th>
                    <th style="width: 15%;">القائل</th>
                    <th style="width: 15%;">التصنيف</th>
                    <th style="width: 10%;">المصدر</th>
                    <th style="width: 10%;">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  @for (r of reflections; track r._id) {
                    <tr>
                      <td><p class="table-text-preview font-hadith">«{{ r.quote }}»</p></td>
                      <td><strong>{{ r.author }}</strong></td>
                      <td><span class="badge badge-purple">{{ r.category }}</span></td>
                      <td>{{ r.source || '—' }}</td>
                      <td>
                        <div class="row-actions">
                          <button class="btn-table-action edit" (click)="editReflection(r)" title="تعديل">
                            <i class="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button class="btn-table-action delete" (click)="deleteReflection(r)" title="حذف">
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- ==================== TAB 4: MEMORIAL SETTINGS ==================== -->
        @if (activeTab === 'memorial') {
          <div class="tab-content card-glass">
            <div class="tab-header-row">
              <div>
                <h2 class="tab-title">إعدادات الصدقة الجارية وإهداء الجدة</h2>
                <span class="tab-sub">تعديل نصوص الإهداء والدعاء والاسم والعدادات التي تظهر في الواجهة الرئيسية</span>
              </div>
            </div>

            <form class="dash-form" (ngSubmit)="saveMemorialSettings()">
              <div class="form-grid-2">
                <div class="form-group">
                  <label>عنوان الإهداء الأساسي (يظهر في أعلى الصفحة الرئيسية وصفحة الإهداء):</label>
                  <input type="text" [(ngModel)]="memorialForm.dedicationTitle" name="dedicationTitle" class="form-input" />
                </div>
                <div class="form-group">
                  <label>اسم الجدة الغالية (رحمها الله):</label>
                  <input type="text" [(ngModel)]="memorialForm.grandmotherName" name="grandmotherName" class="form-input" />
                </div>
              </div>

              <div class="form-group">
                <label>نص الدعاء الأساسي المأثور لها:</label>
                <textarea [(ngModel)]="memorialForm.duaText" name="duaText" rows="4" class="form-textarea font-hadith"></textarea>
              </div>

              <div class="form-group">
                <label>نص الدعاء الثانوي لثواب الموقع:</label>
                <textarea [(ngModel)]="memorialForm.secondaryDua" name="secondaryDua" rows="3" class="form-textarea font-hadith"></textarea>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label>عداد الأدعية الحالي المسجل من الزوار:</label>
                  <input type="number" [(ngModel)]="memorialForm.prayersCount" name="prayersCount" class="form-input" />
                </div>
                <div class="form-group">
                  <label>عداد الختمات المهداة لروحها:</label>
                  <input type="number" [(ngModel)]="memorialForm.khatmaCount" name="khatmaCount" class="form-input" />
                </div>
              </div>

              <div style="margin-top: 10px;">
                <button type="submit" class="btn-primary" [disabled]="savingMemorial">
                  <i class="fa-solid fa-floppy-disk"></i>
                  <span>{{ savingMemorial ? 'جاري الحفظ في MongoDB...' : 'حفظ التعديلات في قاعدة البيانات' }}</span>
                </button>
              </div>
            </form>
          </div>
        }

        <!-- ==================== TAB 5: VISITOR ACTIVITY TRACKER & COUNTER ==================== -->
        @if (activeTab === 'activity') {
          <div class="tab-content card-glass">
            <div class="tab-header-row">
              <div>
                <h2 class="tab-title">عداد وتفاصيل نشاط كل زائر على الموقع</h2>
                <span class="tab-sub">تتبع حي ومباشر لما يفعله زوار الموقع (زيارة الصفحات، الاستماع للقرآن، الحفظ في المحفوظات، المشاركة، والدعاء)</span>
              </div>
              <div class="tab-header-actions">
                <button class="btn-ghost" (click)="loadActivityData()" title="تحديث السجل والعداد">
                  <i class="fa-solid fa-rotate" [class.fa-spin]="loadingActivities"></i> تحديث العداد
                </button>
                <button class="btn-danger-outline" (click)="clearAllActivities()" title="تصفير السجل">
                  <i class="fa-solid fa-trash-can"></i> تفريغ السجل
                </button>
              </div>
            </div>

            <!-- Activity Counter Cards Grid -->
            <div class="activity-stats-grid">
              <div class="act-stat-card card-glass">
                <div class="act-stat-icon purple"><i class="fa-solid fa-users"></i></div>
                <div class="act-stat-data">
                  <span class="act-stat-val">{{ activityStats?.uniqueVisitors || 0 }}</span>
                  <span class="act-stat-lbl">زوار حقيقيون فريدون</span>
                </div>
              </div>

              <div class="act-stat-card card-glass">
                <div class="act-stat-icon emerald"><i class="fa-solid fa-bolt"></i></div>
                <div class="act-stat-data">
                  <span class="act-stat-val">{{ activityStats?.totalActivities || 0 }}</span>
                  <span class="act-stat-lbl">إجمالي حركات ونشاطات الزوار</span>
                </div>
              </div>

              <div class="act-stat-card card-glass">
                <div class="act-stat-icon blue"><i class="fa-solid fa-headphones"></i></div>
                <div class="act-stat-data">
                  <span class="act-stat-val">{{ activityStats?.audioPlays || 0 }}</span>
                  <span class="act-stat-lbl">مرات استماع للقرآن</span>
                </div>
              </div>

              <div class="act-stat-card card-glass">
                <div class="act-stat-icon gold"><i class="fa-solid fa-hands-praying"></i></div>
                <div class="act-stat-data">
                  <span class="act-stat-val">{{ activityStats?.duasCount || 0 }}</span>
                  <span class="act-stat-lbl">تأمين ودعاء للجدة</span>
                </div>
              </div>

              <div class="act-stat-card card-glass">
                <div class="act-stat-icon amber"><i class="fa-solid fa-bookmark"></i></div>
                <div class="act-stat-data">
                  <span class="act-stat-val">{{ activityStats?.bookmarksCount || 0 }}</span>
                  <span class="act-stat-lbl">حفظ في المحفوظات</span>
                </div>
              </div>

              <div class="act-stat-card card-glass">
                <div class="act-stat-icon teal"><i class="fa-solid fa-share-nodes"></i></div>
                <div class="act-stat-data">
                  <span class="act-stat-val">{{ activityStats?.sharesCount || 0 }}</span>
                  <span class="act-stat-lbl">مشاركات للروابط</span>
                </div>
              </div>

              <div class="act-stat-card card-glass">
                <div class="act-stat-icon rose"><i class="fa-solid fa-bead-necklace"></i></div>
                <div class="act-stat-data">
                  <span class="act-stat-val">{{ activityStats?.tasbeehCount || 0 }}</span>
                  <span class="act-stat-lbl">تسبيحة واستغفار</span>
                </div>
              </div>

              <div class="act-stat-card card-glass">
                <div class="act-stat-icon orange"><i class="fa-solid fa-clock-rotate-left"></i></div>
                <div class="act-stat-data">
                  <span class="act-stat-val">{{ activityStats?.todayCount || 0 }}</span>
                  <span class="act-stat-lbl">نشاط آخر 24 ساعة</span>
                </div>
              </div>
            </div>

            <!-- Filters Bar -->
            <div class="activity-filters-bar card-glass">
              <div class="filter-item">
                <label>نوع التفاعل والنشاط:</label>
                <select [(ngModel)]="selectedActivityAction" (change)="loadActivityData()" class="form-input">
                  <option value="ALL">جميع الأنشطة (الكل)</option>
                  <option value="PAGE_VIEW">زيارة وتصفح الصفحات</option>
                  <option value="PLAY_AUDIO">استماع لتلاوة الآيات</option>
                  <option value="BOOKMARK_ADD">إضافة إلى المحفوظات</option>
                  <option value="BOOKMARK_REMOVE">إزالة من المحفوظات</option>
                  <option value="SHARE_LINK">مشاركة رابط المحتوى</option>
                  <option value="DUA_CLICK">دعاء وتأمين للجدة</option>
                  <option value="TASBEEH_CLICK">تسبيح واستغفار</option>
                </select>
              </div>

              <div class="filter-item search-visitor-item">
                <label>تتبع زائر محدد بالمعرّف (Visitor ID):</label>
                <div class="search-input-wrap">
                  <input
                    type="text"
                    [(ngModel)]="visitorFilter"
                    (input)="onVisitorFilterChange()"
                    placeholder="مثال: v_9x7k... (اترك فارغاً لعرض كل الزوار)"
                    class="form-input"
                  />
                  @if (visitorFilter) {
                    <button class="btn-clear-filter" (click)="clearVisitorFilter()"><i class="fa-solid fa-xmark"></i></button>
                  }
                </div>
              </div>
            </div>

            <!-- Live Activities Table -->
            @if (loadingActivities) {
              <div class="loading-state">
                <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
                <p>جاري جلب سجل النشاطات الحية من قاعدة البيانات...</p>
              </div>
            } @else {
              <div class="table-responsive">
                <table class="dash-table">
                  <thead>
                    <tr>
                      <th style="width: 15%;">الوقت والتاريخ</th>
                      <th style="width: 15%;">معرّف الزائر (Visitor ID)</th>
                      <th style="width: 15%;">نوع الإجراء</th>
                      <th style="width: 40%;">تفاصيل النشاط وما فعله المستخدم</th>
                      <th style="width: 15%;">بيانات الجهاز والـ IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (log of activities; track log._id) {
                      <tr>
                        <td>
                          <span class="log-time">{{ formatTime(log.createdAt) }}</span>
                          <small class="log-date text-muted d-block">{{ formatDate(log.createdAt) }}</small>
                        </td>
                        <td>
                          <button class="btn-visitor-tag" (click)="filterByVisitor(log.visitorId)" [title]="'تصفية نشاطات هذا المستخدم فقط'">
                            <i class="fa-solid fa-user"></i>
                            <span>{{ log.visitorId }}</span>
                          </button>
                        </td>
                        <td>
                          <span class="badge" [ngClass]="getActionBadgeClass(log.action)">
                            <i class="fa-solid" [ngClass]="getActionIcon(log.action)"></i>
                            {{ getActionLabel(log.action) }}
                          </span>
                        </td>
                        <td>
                          <div class="log-title-text">{{ log.title }}</div>
                          @if (hasDetails(log.details)) {
                            <div class="log-details-box">
                              <span class="details-json">{{ formatDetails(log.details) }}</span>
                            </div>
                          }
                        </td>
                        <td>
                          <small class="log-device d-block">{{ log.deviceInfo?.screen || '—' }}</small>
                          <small class="text-muted d-block" style="font-size: 0.75rem;">{{ log.ip || 'Localhost' }}</small>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              @if (activities.length === 0) {
                <div class="empty-activities-state">
                  <i class="fa-solid fa-clock-rotate-left fa-3x"></i>
                  <p>لا توجد نشاطات مسجلة تطابق التصفية الحالية.</p>
                </div>
              }
            }
          </div>
        }

        <!-- ==================== MODAL: ADD / EDIT HADITH ==================== -->
        @if (isHadithModalOpen) {
          <div class="modal-overlay" (click)="closeHadithModal()">
            <div class="modal-card card-glass" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h3>{{ editingHadithId ? 'تعديل حديث شريف' : 'إضافة حديث نبوي جديد' }}</h3>
                <button class="btn-close" (click)="closeHadithModal()"><i class="fa-solid fa-xmark"></i></button>
              </div>

              <form class="dash-form modal-body" (ngSubmit)="saveHadith()">
                <div class="form-group">
                  <label>عنوان الحديث / الموعظة:</label>
                  <input type="text" [(ngModel)]="hadithForm.title" name="title" class="form-input" placeholder="مثال: وصية جبريل للنبي ﷺ: قيام الليل وعز المؤمن" />
                </div>

                <div class="form-group">
                  <label>نص الحديث الشريف بالتشكيل:</label>
                  <textarea [(ngModel)]="hadithForm.text" name="text" rows="5" required class="form-textarea font-hadith" placeholder="أدخل نص الحديث النبوي كاملاً بالتشكيل..."></textarea>
                </div>

                <div class="form-grid-2">
                  <div class="form-group">
                    <label>الراوي (الصحابي):</label>
                    <input type="text" [(ngModel)]="hadithForm.narrator" name="narrator" class="form-input" placeholder="مثال: سهل بن سعد الساعدي رضي الله عنه" />
                  </div>
                  <div class="form-group">
                    <label>المصدر / الكتاب:</label>
                    <input type="text" [(ngModel)]="hadithForm.source" name="source" class="form-input" placeholder="مثال: صحيح مسلم / سنن البيهقي" />
                  </div>
                </div>

                <div class="form-grid-3">
                  <div class="form-group">
                    <label>رقم الحديث في المرجع:</label>
                    <input type="text" [(ngModel)]="hadithForm.hadithNumber" name="hadithNumber" class="form-input" placeholder="مثال: رقم 73 في صحيح الجامع" />
                  </div>
                  <div class="form-group">
                    <label>حكم الحديث (الدرجة):</label>
                    <select [(ngModel)]="hadithForm.grading" name="grading" class="form-input">
                      <option value="صحيح">صحيح</option>
                      <option value="حسن">حسن</option>
                      <option value="متفق عليه">متفق عليه</option>
                      <option value="صحيح لغيره">صحيح لغيره</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>المحدّث المحقق:</label>
                    <input type="text" [(ngModel)]="hadithForm.scholar" name="scholar" class="form-input" placeholder="مثال: الشيخ الألباني / البخاري" />
                  </div>
                </div>

                <div class="form-grid-2">
                  <div class="form-group">
                    <label>التصنيف / الموضوع:</label>
                    <input type="text" [(ngModel)]="hadithForm.topic" name="topic" required class="form-input" placeholder="مثال: قيام الليل والمواعظ" />
                  </div>
                  <div class="form-group">
                    <label>رابط التخريج من الدرر السنية (Dorar.net):</label>
                    <input type="url" [(ngModel)]="hadithForm.referenceUrl" name="referenceUrl" class="form-input" placeholder="https://dorar.net/hadith/sharh/..." />
                  </div>
                </div>

                <div class="form-group">
                  <label>الشرح أو الفائدة الإيمانية والتربوية:</label>
                  <textarea [(ngModel)]="hadithForm.explanation" name="explanation" rows="3" class="form-textarea" placeholder="فائدة تربوية أو شرح مبسط يظهر للقارئ..."></textarea>
                </div>

                <div class="modal-footer">
                  <button type="button" class="btn-ghost" (click)="closeHadithModal()">إلغاء</button>
                  <button type="submit" class="btn-primary"><i class="fa-solid fa-check"></i> حفظ الحديث في قاعدة البيانات</button>
                </div>
              </form>
            </div>
          </div>
        }

        <!-- ==================== MODAL: ADD / EDIT ZIKR ==================== -->
        @if (isZikrModalOpen) {
          <div class="modal-overlay" (click)="closeZikrModal()">
            <div class="modal-card card-glass" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h3>{{ editingZikrId ? 'تعديل الذكر' : 'إضافة ذكر جديد' }}</h3>
                <button class="btn-close" (click)="closeZikrModal()"><i class="fa-solid fa-xmark"></i></button>
              </div>

              <form class="dash-form modal-body" (ngSubmit)="saveZikr()">
                <div class="form-grid-2">
                  <div class="form-group">
                    <label>قسم الذكر:</label>
                    <select [(ngModel)]="zikrForm.category" name="category" class="form-input">
                      <option value="أذكار الصباح">أذكار الصباح</option>
                      <option value="أذكار المساء">أذكار المساء</option>
                      <option value="أذكار النوم">أذكار النوم</option>
                      <option value="أذكار بعد الصلاة">أذكار بعد الصلاة</option>
                      <option value="أدعية للمتوفى والصدقة الجارية">أدعية للمتوفى والصدقة الجارية</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>عدد التكرار:</label>
                    <input type="number" [(ngModel)]="zikrForm.count" name="count" min="1" class="form-input" />
                  </div>
                </div>

                <div class="form-group">
                  <label>نص الذكر الشريف:</label>
                  <textarea [(ngModel)]="zikrForm.text" name="text" rows="3" required class="form-textarea font-hadith"></textarea>
                </div>

                <div class="form-group">
                  <label>فضل الذكر وثوابه المترتب عليه:</label>
                  <input type="text" [(ngModel)]="zikrForm.benefit" name="benefit" class="form-input" />
                </div>

                <div class="form-group">
                  <label>المرجع / المصدر:</label>
                  <input type="text" [(ngModel)]="zikrForm.reference" name="reference" class="form-input" placeholder="مثال: صحيح البخاري / صحيح مسلم" />
                </div>

                <div class="modal-footer">
                  <button type="button" class="btn-ghost" (click)="closeZikrModal()">إلغاء</button>
                  <button type="submit" class="btn-primary">حفظ الذكر</button>
                </div>
              </form>
            </div>
          </div>
        }

        <!-- ==================== MODAL: ADD / EDIT REFLECTION ==================== -->
        @if (isReflectionModalOpen) {
          <div class="modal-overlay" (click)="closeReflectionModal()">
            <div class="modal-card card-glass" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h3>{{ editingReflectionId ? 'تعديل الموعظة' : 'إضافة موعظة جديدة' }}</h3>
                <button class="btn-close" (click)="closeReflectionModal()"><i class="fa-solid fa-xmark"></i></button>
              </div>

              <form class="dash-form modal-body" (ngSubmit)="saveReflection()">
                <div class="form-group">
                  <label>نص الموعظة أو الاقتباس:</label>
                  <textarea [(ngModel)]="reflectionForm.quote" name="quote" rows="3" required class="form-textarea font-hadith"></textarea>
                </div>

                <div class="form-grid-2">
                  <div class="form-group">
                    <label>القائل (من السلف الصالح):</label>
                    <input type="text" [(ngModel)]="reflectionForm.author" name="author" required class="form-input" placeholder="مثال: الحسن البصري رحمه الله" />
                  </div>
                  <div class="form-group">
                    <label>التصنيف:</label>
                    <input type="text" [(ngModel)]="reflectionForm.category" name="category" class="form-input" placeholder="مثال: الزهد والموت / قيام الليل" />
                  </div>
                </div>

                <div class="form-group">
                  <label>المصدر / الكتاب:</label>
                  <input type="text" [(ngModel)]="reflectionForm.source" name="source" class="form-input" placeholder="مثال: حلية الأولياء / مدارج السالكين" />
                </div>

                <div class="modal-footer">
                  <button type="button" class="btn-ghost" (click)="closeReflectionModal()">إلغاء</button>
                  <button type="submit" class="btn-primary">حفظ الموعظة</button>
                </div>
              </form>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    /* Lock Screen Security Styles */
    .lock-screen-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .lock-card {
      width: 100%;
      max-width: 520px;
      padding: 45px 35px;
      text-align: center;
      border-radius: var(--radius-xl);
      border: 1px solid var(--border-emerald);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }

    .lock-top-bar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      width: 100%;
      margin-bottom: 14px;
    }

    .theme-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      font-size: 0.85rem;
      border-radius: var(--radius-full);
      cursor: pointer;
    }

    .lock-icon-wrap {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.15);
      color: var(--primary-emerald-light);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      margin-bottom: 18px;
      border: 1px solid var(--border-emerald);
    }

    .lock-title {
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--text-main);
      margin-top: 14px;
      margin-bottom: 10px;
    }

    .lock-sub {
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.7;
      margin-bottom: 28px;
    }

    .lock-form {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .pin-input-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--bg-surface-elevated);
      border: 1.5px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 12px 18px;
      transition: border-color 0.2s;
    }

    .pin-input-wrap:focus-within {
      border-color: var(--primary-emerald);
    }

    .pin-icon {
      color: var(--gold-light);
      font-size: 1.1rem;
    }

    .pin-input {
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-main);
      font-size: 1.05rem;
      width: 100%;
      font-family: inherit;
      direction: rtl;
    }

    .pin-error-msg {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #fb7185;
      font-size: 0.88rem;
      font-weight: 600;
      background: rgba(244, 63, 94, 0.1);
      padding: 8px 14px;
      border-radius: var(--radius-sm);
    }

    .btn-unlock {
      width: 100%;
      padding: 13px;
      font-size: 1.05rem;
    }

    .lock-footer-info {
      margin-top: 25px;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    /* Dashboard Layout */
    .dashboard-wrapper {
      padding: 30px 24px 80px 24px;
    }

    .dash-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 30px;
    }

    .dash-brand-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }

    .port-indicator {
      font-size: 0.8rem;
      color: var(--text-emerald);
      background: rgba(16, 185, 129, 0.1);
      padding: 3px 12px;
      border-radius: var(--radius-full);
      border: 1px solid var(--border-emerald);
    }

    .auth-user-badge {
      font-size: 0.8rem;
      color: var(--gold-light);
      background: rgba(245, 158, 11, 0.1);
      padding: 3px 12px;
      border-radius: var(--radius-full);
      border: 1px solid var(--border-gold);
    }

    .dash-title {
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 6px;
    }

    .dash-subtitle {
      color: var(--text-muted);
      font-size: 1rem;
    }

    .dash-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    /* Stats */
    .stats-overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
      margin-bottom: 35px;
    }

    .stat-card {
      padding: 22px 28px;
      display: flex;
      align-items: center;
      gap: 18px;
      border-radius: var(--radius-lg);
    }

    .stat-icon-circle {
      width: 55px;
      height: 55px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .stat-icon-circle.emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .stat-icon-circle.blue { background: rgba(59, 130, 246, 0.15); color: #93c5fd; }
    .stat-icon-circle.purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
    .stat-icon-circle.gold { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }

    .stat-number {
      font-size: 2rem;
      font-weight: 900;
      color: var(--text-main);
      display: block;
      line-height: 1.1;
    }

    .stat-name {
      font-size: 0.88rem;
      color: var(--text-muted);
    }

    /* Tabs Bar */
    .dash-tabs-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 14px;
      margin-bottom: 25px;
      overflow-x: auto;
    }

    .dash-tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 11px 24px;
      border-radius: var(--radius-md);
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-muted);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
      transition: all 0.2s;
      white-space: nowrap;
      cursor: pointer;
    }

    .dash-tab-btn:hover {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.08);
    }

    .dash-tab-btn.active {
      background: var(--primary-emerald);
      color: #ffffff;
      border-color: var(--primary-emerald);
      box-shadow: 0 4px 15px var(--primary-emerald-glow);
    }

    .tab-content {
      padding: 32px;
      border-radius: var(--radius-xl);
    }

    .tab-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 25px;
      flex-wrap: wrap;
      gap: 14px;
    }

    .tab-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 4px;
    }

    .tab-sub {
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    /* Tables */
    .table-responsive {
      overflow-x: auto;
    }

    .dash-table {
      width: 100%;
      border-collapse: collapse;
      text-align: right;
      font-size: 0.95rem;
    }

    .dash-table th {
      background: rgba(255, 255, 255, 0.04);
      padding: 14px 18px;
      color: var(--text-muted);
      font-weight: 700;
      border-bottom: 1px solid var(--border-subtle);
    }

    .dash-table td {
      padding: 18px;
      border-bottom: 1px solid var(--border-subtle);
      vertical-align: middle;
    }

    .table-title {
      font-weight: 700;
      color: var(--text-main);
      display: block;
      margin-bottom: 4px;
      font-size: 1rem;
    }

    .table-text-preview {
      max-width: 650px;
      color: var(--text-gold);
      font-size: 1.15rem;
      line-height: 1.9;
    }

    .row-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn-table-action {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-muted);
      border: none;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .btn-table-action.edit:hover {
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
    }

    .btn-table-action.delete:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    /* Forms */
    .dash-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .form-group label {
      font-size: 0.92rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    .form-input, .form-textarea {
      background: var(--bg-surface-elevated);
      color: var(--text-main);
      border: 1px solid var(--border-subtle);
      padding: 12px 16px;
      border-radius: var(--radius-md);
      font-family: inherit;
      font-size: 1rem;
      outline: none;
    }

    .form-input:focus, .form-textarea:focus {
      border-color: var(--primary-emerald);
    }

    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
    }

    .form-grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 18px;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .modal-card {
      width: 100%;
      max-width: 780px;
      max-height: 92vh;
      overflow-y: auto;
      background: #0f172a;
      border: 1.5px solid var(--border-emerald);
      border-radius: var(--radius-xl);
      padding: 32px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 16px;
      margin-bottom: 22px;
    }

    .modal-header h3 {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--text-main);
    }

    .btn-close {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      background: none;
      border: none;
      cursor: pointer;
    }

    .btn-close:hover { color: #ef4444; }

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 14px;
      margin-top: 14px;
    }

    @media (max-width: 900px) {
      .form-grid-2, .form-grid-3 { grid-template-columns: 1fr; }
    }

    /* Activity Tracker & Analytics Tab */
    .activity-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 25px;
    }

    .act-stat-card {
      padding: 18px 20px;
      display: flex;
      align-items: center;
      gap: 14px;
      border-radius: var(--radius-lg);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .act-stat-card:hover {
      transform: translateY(-2px);
    }

    .act-stat-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      flex-shrink: 0;
    }

    .act-stat-icon.purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
    .act-stat-icon.emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .act-stat-icon.blue { background: rgba(59, 130, 246, 0.15); color: #93c5fd; }
    .act-stat-icon.gold { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
    .act-stat-icon.amber { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .act-stat-icon.teal { background: rgba(20, 184, 166, 0.15); color: #2dd4bf; }
    .act-stat-icon.rose { background: rgba(244, 63, 94, 0.15); color: #fb7185; }
    .act-stat-icon.orange { background: rgba(249, 115, 22, 0.15); color: #fb923c; }

    .act-stat-val {
      font-size: 1.6rem;
      font-weight: 900;
      color: var(--text-main);
      display: block;
      line-height: 1.1;
    }

    .act-stat-lbl {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .activity-filters-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 16px 20px;
      border-radius: var(--radius-md);
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .filter-item {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .filter-item label {
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    .search-visitor-item {
      flex: 1;
      max-width: 420px;
    }

    .btn-visitor-tag {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--border-subtle);
      color: var(--text-emerald);
      border-radius: var(--radius-full);
      padding: 4px 12px;
      font-size: 0.8rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
      direction: ltr;
      font-family: monospace;
    }

    .btn-visitor-tag:hover {
      background: var(--primary-emerald);
      color: #ffffff;
      border-color: var(--primary-emerald);
    }

    .log-time {
      font-weight: 700;
      color: var(--text-main);
      font-size: 0.9rem;
    }

    .log-date {
      font-size: 0.78rem;
    }

    .log-title-text {
      font-weight: 600;
      color: var(--text-main);
      margin-bottom: 4px;
      line-height: 1.5;
    }

    .log-details-box {
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 4px 10px;
      margin-top: 4px;
      display: inline-block;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .details-json {
      font-size: 0.78rem;
      color: var(--text-muted);
      direction: ltr;
      display: inline-block;
    }

    .empty-activities-state {
      text-align: center;
      padding: 50px 20px;
      color: var(--text-muted);
    }

    .empty-activities-state p {
      margin-top: 14px;
      font-size: 1.05rem;
    }

    .tab-header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .search-input-wrap {
      position: relative;
      display: flex;
      align-items: center;
      flex: 1;
    }

    .btn-clear-filter {
      position: absolute;
      left: 10px;
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
    }

    .highlight-tab {
      border-color: rgba(16, 185, 129, 0.35) !important;
    }

    body.light-theme .act-stat-card {
      background: #ffffff !important;
      border-color: rgba(15, 23, 42, 0.08) !important;
    }

    body.light-theme .activity-filters-bar {
      background: #ffffff !important;
      border-color: rgba(15, 23, 42, 0.08) !important;
    }

    body.light-theme .btn-visitor-tag {
      background: #f1f5f9;
      color: #047857;
      border-color: rgba(15, 23, 42, 0.12);
    }

    body.light-theme .log-details-box {
      background: #f8fafc;
      border-color: rgba(15, 23, 42, 0.1);
    }
  `]
})
export class AppComponent implements OnInit {
  private api = inject(ApiService);

  // Security Auth state
  isAuthenticated = false;
  enteredPin = '';
  loginError = '';
  private readonly ADMIN_PIN = '123456';

  activeTab: 'hadiths' | 'azkar' | 'reflections' | 'memorial' | 'activity' = 'hadiths';

  // Activity Tracker State
  activityStats: any = null;
  activities: any[] = [];
  loadingActivities = false;
  selectedActivityAction = 'ALL';
  visitorFilter = '';

  stats: any = null;
  hadiths: Hadith[] = [];
  azkar: Zikr[] = [];
  reflections: Reflection[] = [];
  memorial: Memorial | null = null;

  isHadithModalOpen = false;
  editingHadithId: string | null = null;
  hadithForm: Partial<Hadith> = this.resetHadithForm();

  isZikrModalOpen = false;
  editingZikrId: string | null = null;
  zikrForm: Partial<Zikr> = this.resetZikrForm();

  isReflectionModalOpen = false;
  editingReflectionId: string | null = null;
  reflectionForm: Partial<Reflection> = this.resetReflectionForm();

  savingMemorial = false;
  memorialForm: Partial<Memorial> = {
    dedicationTitle: '',
    grandmotherName: '',
    duaText: '',
    secondaryDua: '',
    prayersCount: 0,
    khatmaCount: 0,
  };

  isLight = false;

  toggleTheme() {
    this.isLight = !this.isLight;
    if (this.isLight) {
      document.body.classList.add('light-theme');
      localStorage.setItem('nour_dash_theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('nour_dash_theme', 'dark');
    }
  }

  ngOnInit() {
    const savedTheme = localStorage.getItem('nour_dash_theme');
    if (savedTheme === 'light') {
      this.isLight = true;
      document.body.classList.add('light-theme');
    }

    const savedAuth = localStorage.getItem('quran_admin_auth');
    if (savedAuth === 'true') {
      this.isAuthenticated = true;
      this.loadAllData();
    }
  }

  unlockDashboard() {
    if (this.enteredPin === this.ADMIN_PIN) {
      this.isAuthenticated = true;
      this.loginError = '';
      localStorage.setItem('quran_admin_auth', 'true');
      this.loadAllData();
    } else {
      this.loginError = 'رمز المرور غير صحيح، يرجى المحاولة مرة أخرى.';
    }
  }

  logout() {
    this.isAuthenticated = false;
    this.enteredPin = '';
    localStorage.removeItem('quran_admin_auth');
  }

  loadAllData() {
    this.loadStats();
    this.loadActivityStats();
    this.loadHadiths();
    this.loadAzkar();
    this.loadReflections();
    this.loadMemorial();
  }

  loadStats() {
    this.api.getStats().subscribe({
      next: (res) => { if (res.data) this.stats = res.data; },
    });
  }

  loadHadiths() {
    this.api.getHadiths('الكل', 'الكل', '', 1, 100).subscribe({
      next: (res) => { if (res.data) this.hadiths = res.data; },
    });
  }

  loadAzkar() {
    this.api.getAzkar('الكل').subscribe({
      next: (res) => { if (res.data) this.azkar = res.data; },
    });
  }

  loadReflections() {
    this.api.getReflections('الكل').subscribe({
      next: (res) => { if (res.data) this.reflections = res.data; },
    });
  }

  loadMemorial() {
    this.api.getMemorial().subscribe({
      next: (res) => {
        if (res.data) {
          this.memorial = res.data;
          this.memorialForm = { ...res.data };
        }
      },
    });
  }

  triggerSeedData() {
    if (confirm('هل تريد تهيئة واستعادة المحتوى الإيماني المعتمد في MongoDB؟')) {
      this.api.seedData().subscribe({
        next: () => {
          alert('تم تهيئة المحتوى في قاعدة البيانات بنجاح!');
          this.loadAllData();
        },
      });
    }
  }

  // Hadiths CRUD
  resetHadithForm(): Partial<Hadith> {
    return {
      title: '',
      text: '',
      narrator: '',
      source: '',
      hadithNumber: '',
      grading: 'صحيح',
      scholar: 'الشيخ الألباني',
      topic: 'الرقائق والمواعظ',
      explanation: '',
      referenceUrl: '',
      isFeatured: false,
    };
  }

  openHadithModal() {
    this.editingHadithId = null;
    this.hadithForm = this.resetHadithForm();
    this.isHadithModalOpen = true;
  }

  editHadith(h: Hadith) {
    this.editingHadithId = h._id || null;
    this.hadithForm = { ...h };
    this.isHadithModalOpen = true;
  }

  closeHadithModal() {
    this.isHadithModalOpen = false;
  }

  saveHadith() {
    if (!this.hadithForm.text) {
      alert('يرجى كتابة نص الحديث');
      return;
    }
    if (this.editingHadithId) {
      this.api.updateHadith(this.editingHadithId, this.hadithForm).subscribe({
        next: () => {
          alert('تم تعديل الحديث بنجاح في قاعدة البيانات وتحديث الموقع الرئيسي');
          this.closeHadithModal();
          this.loadHadiths();
          this.loadStats();
        },
      });
    } else {
      this.api.createHadith(this.hadithForm).subscribe({
        next: () => {
          alert('تمت إضافة الحديث بنجاح وعرضه في الموقع الرئيسي');
          this.closeHadithModal();
          this.loadHadiths();
          this.loadStats();
        },
      });
    }
  }

  deleteHadith(h: Hadith) {
    if (!h._id) return;
    if (confirm(`هل أنت متأكد من حذف هذا الحديث: «${h.title || h.text.substring(0, 30)}...» من الموقع الرئيسي؟`)) {
      this.api.deleteHadith(h._id).subscribe({
        next: () => {
          this.loadHadiths();
          this.loadStats();
        },
      });
    }
  }

  // Azkar CRUD
  resetZikrForm(): Partial<Zikr> {
    return {
      category: 'أذكار الصباح',
      text: '',
      count: 1,
      benefit: '',
      reference: '',
      order: 0,
    };
  }

  openZikrModal() {
    this.editingZikrId = null;
    this.zikrForm = this.resetZikrForm();
    this.isZikrModalOpen = true;
  }

  editZikr(z: Zikr) {
    this.editingZikrId = z._id || null;
    this.zikrForm = { ...z };
    this.isZikrModalOpen = true;
  }

  closeZikrModal() {
    this.isZikrModalOpen = false;
  }

  saveZikr() {
    if (!this.zikrForm.text) {
      alert('يرجى كتابة نص الذكر');
      return;
    }
    if (this.editingZikrId) {
      this.api.updateZikr(this.editingZikrId, this.zikrForm).subscribe({
        next: () => {
          alert('تم تعديل الذكر بنجاح');
          this.closeZikrModal();
          this.loadAzkar();
          this.loadStats();
        },
      });
    } else {
      this.api.createZikr(this.zikrForm).subscribe({
        next: () => {
          alert('تمت إضافة الذكر بنجاح');
          this.closeZikrModal();
          this.loadAzkar();
          this.loadStats();
        },
      });
    }
  }

  deleteZikr(z: Zikr) {
    if (!z._id) return;
    if (confirm('هل أنت متأكد من حذف هذا الذكر من الموقع الرئيسي؟')) {
      this.api.deleteZikr(z._id).subscribe({
        next: () => {
          this.loadAzkar();
          this.loadStats();
        },
      });
    }
  }

  // Reflections CRUD
  resetReflectionForm(): Partial<Reflection> {
    return {
      quote: '',
      author: '',
      category: 'الزهد والموت',
      source: '',
      isFeatured: false,
    };
  }

  openReflectionModal() {
    this.editingReflectionId = null;
    this.reflectionForm = this.resetReflectionForm();
    this.isReflectionModalOpen = true;
  }

  editReflection(r: Reflection) {
    this.editingReflectionId = r._id || null;
    this.reflectionForm = { ...r };
    this.isReflectionModalOpen = true;
  }

  closeReflectionModal() {
    this.isReflectionModalOpen = false;
  }

  saveReflection() {
    if (!this.reflectionForm.quote) {
      alert('يرجى كتابة نص الموعظة');
      return;
    }
    if (this.editingReflectionId) {
      this.api.updateReflection(this.editingReflectionId, this.reflectionForm).subscribe({
        next: () => {
          alert('تم تعديل الموعظة بنجاح');
          this.closeReflectionModal();
          this.loadReflections();
          this.loadStats();
        },
      });
    } else {
      this.api.createReflection(this.reflectionForm).subscribe({
        next: () => {
          alert('تمت إضافة الموعظة بنجاح');
          this.closeReflectionModal();
          this.loadReflections();
          this.loadStats();
        },
      });
    }
  }

  deleteReflection(r: Reflection) {
    if (!r._id) return;
    if (confirm('هل أنت متأكد من حذف هذه الموعظة؟')) {
      this.api.deleteReflection(r._id).subscribe({
        next: () => {
          this.loadReflections();
          this.loadStats();
        },
      });
    }
  }

  // Memorial Settings
  saveMemorialSettings() {
    this.savingMemorial = true;
    this.api.updateMemorial(this.memorialForm).subscribe({
      next: () => {
        alert('تم حفظ إعدادات الصدقة الجارية وإهداء الجدة بنجاح في قاعدة البيانات وتحديث الموقع الرئيسي!');
        this.savingMemorial = false;
        this.loadMemorial();
        this.loadStats();
      },
      error: () => {
        this.savingMemorial = false;
      },
    });
  }

  // Activity Tracker & Counter Methods
  switchTabToActivity() {
    this.activeTab = 'activity';
    this.loadActivityStats();
    this.loadActivityData();
  }

  loadActivityStats() {
    this.api.getActivityStats().subscribe({
      next: (res) => {
        if (res.data) this.activityStats = res.data;
      },
    });
  }

  loadActivityData() {
    this.loadingActivities = true;
    this.api
      .getRecentActivities(this.selectedActivityAction, this.visitorFilter, 1, 100)
      .subscribe({
        next: (res) => {
          if (res.data) this.activities = res.data;
          this.loadingActivities = false;
        },
        error: () => {
          this.loadingActivities = false;
        },
      });
  }

  filterByVisitor(visitorId: string) {
    this.visitorFilter = visitorId;
    this.loadActivityData();
  }

  clearVisitorFilter() {
    this.visitorFilter = '';
    this.loadActivityData();
  }

  onVisitorFilterChange() {
    this.loadActivityData();
  }

  clearAllActivities() {
    if (confirm('هل أنت متأكد من تفريغ سجل نشاطات وتفاعلات الزوار؟ لا يمكن التراجع عن هذه الخطوة.')) {
      this.api.clearActivities().subscribe({
        next: () => {
          alert('تم تفريغ سجل النشاطات بنجاح.');
          this.loadActivityStats();
          this.loadActivityData();
        },
      });
    }
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return dateStr;
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  }

  getActionLabel(action: string): string {
    switch (action) {
      case 'PAGE_VIEW': return 'تصفح صفحة';
      case 'PLAY_AUDIO': return 'استماع تلاوة';
      case 'READ_SURAH': return 'قراءة سورة';
      case 'BOOKMARK_ADD': return 'إضافة محفوظات';
      case 'BOOKMARK_REMOVE': return 'إزالة محفوظات';
      case 'SHARE_LINK': return 'مشاركة رابط';
      case 'DUA_CLICK': return 'تأمين ودعاء';
      case 'TASBEEH_CLICK': return 'تسبيح وذكر';
      case 'COPY_TEXT': return 'نسخ نص';
      default: return action;
    }
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'PAGE_VIEW': return 'fa-eye';
      case 'PLAY_AUDIO': return 'fa-headphones';
      case 'READ_SURAH': return 'fa-book-open';
      case 'BOOKMARK_ADD': return 'fa-bookmark';
      case 'BOOKMARK_REMOVE': return 'fa-bookmark-slash';
      case 'SHARE_LINK': return 'fa-share-nodes';
      case 'DUA_CLICK': return 'fa-hands-praying';
      case 'TASBEEH_CLICK': return 'fa-bead-necklace';
      case 'COPY_TEXT': return 'fa-copy';
      default: return 'fa-circle-dot';
    }
  }

  getActionBadgeClass(action: string): string {
    switch (action) {
      case 'PAGE_VIEW': return 'badge-blue';
      case 'PLAY_AUDIO': return 'badge-emerald';
      case 'READ_SURAH': return 'badge-emerald';
      case 'BOOKMARK_ADD': return 'badge-amber';
      case 'BOOKMARK_REMOVE': return 'badge-rose';
      case 'SHARE_LINK': return 'badge-teal';
      case 'DUA_CLICK': return 'badge-gold';
      case 'TASBEEH_CLICK': return 'badge-purple';
      case 'COPY_TEXT': return 'badge-blue';
      default: return 'badge-purple';
    }
  }

  hasDetails(details: any): boolean {
    return details && Object.keys(details).length > 0;
  }

  formatDetails(details: any): string {
    if (!details) return '';
    try {
      const parts: string[] = [];
      for (const [key, val] of Object.entries(details)) {
        if (val !== undefined && val !== null && val !== '') {
          parts.push(`${key}: ${val}`);
        }
      }
      return parts.join(' • ');
    } catch {
      return '';
    }
  }
}

