# Spotmate Waitlist Landing Page

A beautiful, responsive landing page for collecting waitlist signups for the Spotmate app.

## Features

- ✅ Beautiful, modern design matching Spotmate branding
- ✅ **WhatsApp number collection (optional)** - 5X better reach than email!
- ✅ Country and city selection using CountryStateCity API
- ✅ Real-time waitlist counter
- ✅ Email validation and duplicate checking
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Integrated with Supabase database
- ✅ Ready to deploy on GitHub Pages (FREE hosting)

## Setup Instructions

### 1. Create Supabase Table

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your Spotmate project
3. Go to **SQL Editor** → **New Query**
4. Copy and paste the contents of `waitlist-schema.sql`
5. Click **Run** to create the table

### 2. Deploy to GitHub Pages (FREE Hosting)

#### Option A: GitHub Desktop (Easiest)

1. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Name: `spotmate-waitlist`
   - Public or Private (your choice)
   - Don't initialize with README
   - Click "Create repository"

2. Upload files:
   - In GitHub, click "uploading an existing file"
   - Drag all files from this folder:
     - index.html
     - styles.css
     - script.js
     - config.js
     - logo.png
     - favicon.png
   - Commit changes

3. Enable GitHub Pages:
   - Go to repository Settings
   - Scroll to "Pages" section
   - Source: Deploy from a branch
   - Branch: main / root
   - Click Save

4. Wait 2-3 minutes, then visit:
   ```
   https://your-username.github.io/spotmate-waitlist
   ```

#### Option B: Git Command Line

```bash
cd "E:\Projects\waitlist spotmate"

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Spotmate waitlist landing page"

# Create GitHub repo (replace YOUR_USERNAME)
# Then add remote
git remote add origin https://github.com/YOUR_USERNAME/spotmate-waitlist.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Then enable GitHub Pages in repository settings.

#### Option C: Vercel (Alternative, also FREE)

1. Go to https://vercel.com
2. Import the folder
3. Deploy (takes 1 minute)
4. Get instant URL: `https://spotmate-waitlist.vercel.app`

### 3. Share the Waitlist URL

Once deployed, share your waitlist page:
- Social media (Twitter, Facebook, Instagram)
- WhatsApp groups
- Email signature
- Reddit, forums
- Paid ads (Google, Facebook)

## File Structure

```
waitlist spotmate/
├── index.html           # Main landing page
├── styles.css           # Beautiful styling
├── script.js            # Form handling & Supabase integration
├── config.js            # API keys and configuration
├── logo.png             # Spotmate logo (from main app)
├── favicon.png          # Browser tab icon
├── waitlist-schema.sql  # Database schema
└── README.md            # This file
```

## How It Works

### User Flow:
1. User visits waitlist page
2. Fills in: Name, Email, Country, City, Area
3. Clicks "Join Waitlist"
4. Data saved to Supabase `waitlist` table
5. Success message shows with city-specific count
6. Total counter updates automatically

### Database Structure:
```sql
waitlist (
  id UUID
  name TEXT
  email TEXT (unique)
  country TEXT (ISO code)
  country_name TEXT
  city TEXT
  area TEXT
  created_at TIMESTAMP
)
```

## Tracking Signups

### View All Waitlist Signups

In Supabase SQL Editor:
```sql
SELECT * FROM waitlist ORDER BY created_at DESC;
```

### Count by City

```sql
SELECT city, country_name, COUNT(*) as signups
FROM waitlist
GROUP BY city, country_name
ORDER BY signups DESC;
```

### Check When City Hits 1000

```sql
SELECT city, COUNT(*) as signups
FROM waitlist
GROUP BY city
HAVING COUNT(*) >= 1000;
```

### Export All Emails for Email Campaign

```sql
SELECT email, name, city FROM waitlist WHERE city = 'Lahore';
```

## Customization

### Change Colors

Edit `styles.css`:
```css
:root {
    --primary: #B4FF00;  /* Neon green */
    --background: #010101;  /* Dark background */
}
```

### Add More Fields

1. Edit `index.html` - add form field
2. Edit `script.js` - include in formData
3. Edit `waitlist-schema.sql` - add column to table

### Update Copy

Edit text in `index.html`:
- Hero title/subtitle
- Form description
- Features section
- Footer

## Analytics (Optional)

Add Google Analytics to track visitors:

In `index.html`, before `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR_GA_ID');
</script>
```

## Marketing Ideas

### Get to 1000 Signups Fast:

1. **Social Media Blitz**
   - Post on Facebook groups (sports, fitness, local city groups)
   - Instagram stories with link in bio
   - Twitter with hashtags #Lahore #Cricket #Tennis

2. **WhatsApp Marketing**
   - Share in sports groups
   - Ask friends to share in their groups
   - Create a referral program (winner gets free premium?)

3. **Local Partnerships**
   - Contact gyms, sports clubs
   - Ask to share waitlist link
   - Offer exclusive early access

4. **Content Marketing**
   - Blog: "5 Ways to Find Tennis Partners in Lahore"
   - YouTube: "Why Playing Sports Alone Sucks"
   - Reddit: Post in r/Pakistan, r/fitness

5. **Paid Ads** (if budget available)
   - Facebook Ads: Target sports enthusiasts in Lahore
   - Google Ads: Keyword "tennis partner lahore"
   - Cost: ~$50-100 can get 1000 signups

## Troubleshooting

### Countries not loading?
- Check browser console for errors
- Verify API key in `config.js`
- Check internet connection

### Form not submitting?
- Check Supabase connection
- Verify table exists
- Check RLS policies are enabled

### Styling looks broken?
- Clear browser cache (Ctrl + Shift + R)
- Check `styles.css` is loading
- Inspect browser console

## Support

If you encounter issues:
1. Check browser console (F12) for errors
2. Verify SQL table was created correctly
3. Test API keys are working
4. Check GitHub Pages deployment status

## Next Steps

After hitting 1000 signups in a city:

1. **Email Campaign**
   ```sql
   SELECT email, name FROM waitlist WHERE city = 'Lahore';
   ```
   Export and send mass email: "🎉 Lahore is LIVE!"

2. **Publish Full App**
   - Complete Play Store setup
   - Launch working app (no waitlist screen)
   - Send download link to all users

3. **Celebration!** 🎉
   - First city unlocked
   - Real users, real traction
   - Start building community

---

**Built with ❤️ for Spotmate**
Never play alone again! 🎾
