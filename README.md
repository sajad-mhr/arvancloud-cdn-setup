# 📄 ArvanCloud CDN Setup Script

این اسکریپت یک ابزار **CLI مرحله‌ای** برای راه‌اندازی و پیکربندی دامنه روی ArvanCloud CDN است. شما می‌توانید به صورت مرحله‌ای یا تمام مراحل را پشت سر هم اجرا کنید: افزودن دامنه، اضافه کردن رکوردهای DNS، فعال‌سازی SSL و ریدایرکت HTTPS.

---

## ⚡ ویژگی‌ها

* افزودن دامنه (Full / Partial) به ArvanCloud CDN
* انتظار برای فعال شدن دامنه (`waitForActivation`)
* افزودن رکوردهای DNS به صورت خودکار
* انتظار برای صدور گواهینامه SSL (`waitForSslIssued`)
* فعال‌سازی SSL با امکان **ریدایرکت HTTPS**
* اجرا به صورت مرحله‌ای از طریق **CLI Menu**
* قابلیت اجرای **همه مراحل با یک گزینه (Run All)**

---

## 📦 پیش‌نیازها

1. Node.js >= 18
2. npm
3. کلید API از ArvanCloud

---

## 🔧 نصب

1. کلون کردن مخزن یا دانلود فایل‌ها:

```bash
git clone <repository-url>
cd <project-folder>
```

2. نصب وابستگی‌ها:

```bash
npm install
```

3. ایجاد فایل `.env` و پر کردن متغیرها:

```env
# کلید API شما
ARVAN_API_KEY=

# دامنه شما
DOMAIN=

# full | partial
DOMAIN_TYPE=

# 0 - Traffic, 1 - Basic, 2 - Growth, 3 - Professional, 4 - Enterprise
PLAN_LEVEL=

# ipv4
ORIGIN_HOST=

# Wildcard(*) اگر planLevel > 1
# exp(@,www, etc . . .)
DNS_NAME=

 # true | false
HTTPS_REDIRECT=
```

> 🔹 توضیحات متغیرها:
>
> * `ARVAN_API_KEY`: کلید API ArvanCloud
> * `DOMAIN`: نام دامنه شما
> * `DOMAIN_TYPE`: نوع دامنه (`full` یا `partial`)
> * `PLAN_LEVEL`: سطح پلن CDN (برای دامنه Partial)
> * `ORIGIN_HOST`: آی‌پی سرور مقصد (origin)
> * `DNS_NAME`: نام رکوردهای DNS (مثلاً `@,www`)
> * `HTTPS_REDIRECT`: فعال‌سازی ریدایرکت HTTPS (`true` یا `false`)

---

## 🚀 اجرای اسکریپت

اجرای اسکریپت با Node.js:

```bash
node index.js
```

پس از اجرای دستور، یک منوی ساده CLI ظاهر می‌شود:

```
Select an option:
1 - Run All
2 - Add Domain
3 - Add DNS
4 - Configure SSL
```

### گزینه‌ها:

1. **Run All**
   اجرا کردن تمام مراحل پشت سر هم:

   * افزودن دامنه
   * انتظار برای فعال شدن دامنه
   * افزودن DNS
   * انتظار برای صدور SSL
   * پیکربندی SSL و ریدایرکت HTTPS

2. **Add Domain**
   افزودن دامنه به ArvanCloud.

3. **Add DNS**
   افزودن رکوردهای DNS (نیازمند اجرای `waitForActivation` قبل از اجرا).

4. **Configure SSL**
   فعال‌سازی SSL و ریدایرکت HTTPS (نیازمند اجرای `waitForSslIssued` قبل از اجرا).

---

## ⏳ زمان‌بندی‌ها و نکات

* انتظار برای فعال شدن دامنه (`waitForActivation`) تا **30 دقیقه** انجام می‌شود و هر دقیقه وضعیت چک می‌شود.
* انتظار برای صدور SSL (`waitForSslIssued`) تا **30 دقیقه** انجام می‌شود و هر دقیقه چک می‌کند.
* در صورت بروز خطا، اسکریپت پیام خطا نمایش داده و متوقف می‌شود.

---

## 📌 نکات مهم

* مطمئن شوید `ARVAN_API_KEY` معتبر است و دسترسی کامل برای مدیریت دامنه دارد.
* اگر `DOMAIN_TYPE` برابر `partial` است، `PLAN_LEVEL` باید مشخص شود.
* اگر از رکورد wildcard (`*`) استفاده می‌کنید، `planLevel` باید بزرگ‌تر از 1 باشد.
* پس از افزودن دامنه، اجرای `addDNS` بدون فعال شدن دامنه امکان‌پذیر نیست.
* پس از فعال شدن SSL، می‌توانید ریدایرکت HTTPS را فعال کنید.

---
