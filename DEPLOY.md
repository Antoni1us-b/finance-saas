# 🚀 Deploy Guide — FinFlow

## ขั้นตอนครั้งแรก (ทำครั้งเดียว)

### 1. สร้าง GitHub Repository

```bash
cd "/Users/supachai/Documents/Code Project/finance-saas"

# init git
git init
git add .
git commit -m "feat: initial FinFlow MVP"

# สร้าง repo บน GitHub แล้ว push
git remote add origin https://github.com/YOUR_USERNAME/finflow.git
git branch -M main
git push -u origin main
```

### 2. Connect Vercel กับ GitHub

1. ไปที่ [vercel.com](https://vercel.com) → **New Project**
2. เลือก GitHub repo `finflow`
3. Framework Preset: **Next.js** (detect อัตโนมัติ)
4. ใส่ Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL       = https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY  = eyJhbGci...
   ```
5. กด **Deploy**

### 3. ตั้งค่า GitHub Secrets สำหรับ CI/CD

ไปที่ GitHub repo → **Settings → Secrets → Actions** → เพิ่ม:

| Secret Name        | วิธีหา |
|-------------------|--------|
| `VERCEL_TOKEN`    | vercel.com → Account Settings → Tokens → Create |
| `VERCEL_ORG_ID`   | รันใน terminal: `vercel env ls` หรือดูใน `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | ไฟล์ `.vercel/project.json` หลัง link project แล้ว |

```bash
# Link project เพื่อดู IDs
npx vercel link
cat .vercel/project.json
```

### 4. ตั้งค่า Admin Account

รัน SQL ใน Supabase SQL Editor:
```sql
-- เปลี่ยน email เป็นของคุณ
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');
```

---

## การ Deploy ครั้งถัดไป (อัตโนมัติ)

```
push to main  →  GitHub Actions รัน  →  Type check + Lint  →  Deploy Production
สร้าง PR      →  Preview Deploy อัตโนมัติ  →  URL แสดงใน PR comment
```

---

## ตรวจสอบ Deploy

```bash
# ดู deployment logs
vercel logs

# ดู production URL
vercel ls

# Rollback ถ้ามีปัญหา
vercel rollback
```

---

## Version Management

```bash
# patch release (bug fix): 0.1.0 → 0.1.1
npm version patch && git push && git push --tags

# minor release (feature): 0.1.0 → 0.2.0
npm version minor && git push && git push --tags

# major release: 0.1.0 → 1.0.0
npm version major && git push && git push --tags
```

Tags แต่ละตัวจะ trigger GitHub Actions deploy อัตโนมัติ
