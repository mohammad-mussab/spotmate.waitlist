# WhatsApp Messaging Guide for City Launch

## When Your City Hits 1000 Signups

Follow this step-by-step guide to notify users via WhatsApp when their city goes live.

---

## Step 1: Export WhatsApp Numbers

Run this SQL in **Supabase Dashboard → SQL Editor**:

```sql
-- Get all WhatsApp numbers for Lahore (replace with your city)
SELECT
  name,
  whatsapp_number,
  email
FROM waitlist
WHERE city = 'Lahore'
  AND whatsapp_number IS NOT NULL
ORDER BY created_at;
```

**Expected result:**
```
name            whatsapp_number      email
Ali Khan        +923001234567       ali@email.com
Sara Ahmed      +923217654321       sara@email.com
...
```

Click **Download CSV** and save the file.

---

## Step 2: Prepare Your Message

### WhatsApp Message Template (Keep it SHORT!)

```
🎉 *LAHORE IS LIVE!*

Spotmate just launched in Lahore! You're one of the first 1,000 people.

Download now and find your perfect activity partner:
https://play.google.com/store/apps/details?id=com.spotmate.app

See you on the court! 🎾
- Spotmate Team
```

**Why this works:**
- ✅ Short and exciting (WhatsApp users skim messages)
- ✅ Emoji grabs attention
- ✅ Clear call-to-action (Download link)
- ✅ Personal touch ("first 1,000 people")
- ✅ Under 160 characters for SMS fallback

---

## Step 3A: Send Via WhatsApp Web (Free, 100-500 users)

**Best for:** First city launch, 100-500 WhatsApp signups

### Instructions:

1. **Open WhatsApp Web**
   - Go to https://web.whatsapp.com
   - Scan QR code with your phone

2. **Send to Each Number**
   - Click "New Chat" → type phone number
   - Paste message
   - Send
   - Repeat for each user

**Time estimate:** 1-2 hours for 500 people

**Tips:**
- Take breaks every 50 messages (avoid WhatsApp spam detection)
- Personalize first line: "Hi Ali! 🎉 Lahore is LIVE!"
- Send during peak hours (6-9 PM Pakistan time)

---

## Step 3B: Use WhatsApp Business API (Paid, 500+ users)

**Best for:** Multiple city launches, 500+ WhatsApp signups

### Option 1: Twilio WhatsApp API

**Cost:** ~$0.005 per message (500 messages = $2.50)

**Setup:**
1. Create account at https://www.twilio.com/
2. Set up WhatsApp sender (requires approval, ~24 hours)
3. Use their API to send bulk messages

**Example code (Node.js):**
```javascript
const twilio = require('twilio');
const client = twilio(accountSid, authToken);

// Read CSV of WhatsApp numbers
const users = readCSV('lahore-whatsapp.csv');

for (const user of users) {
  await client.messages.create({
    from: 'whatsapp:+14155238886', // Your Twilio WhatsApp number
    to: `whatsapp:${user.whatsapp_number}`,
    body: `🎉 Hi ${user.name}! Lahore is LIVE! Download Spotmate now: [link]`
  });

  // Rate limit: 1 message per second
  await sleep(1000);
}
```

### Option 2: WATI (WhatsApp Business Platform)

**Cost:** ~$50/month for 1000 messages

**Features:**
- ✅ Bulk messaging dashboard
- ✅ Message templates
- ✅ Analytics (delivery rates, read rates)
- ✅ No coding required

**Website:** https://www.wati.io/

### Option 3: Respond.io

**Cost:** Free for first 100 contacts, then $79/month

**Features:**
- ✅ Multi-channel (WhatsApp, Email, SMS)
- ✅ CRM features
- ✅ Automation workflows

**Website:** https://respond.io/

---

## Step 4: Send Email to Remaining Users

For users who DIDN'T provide WhatsApp, send email:

```sql
-- Get email-only users
SELECT
  name,
  email,
  city
FROM waitlist
WHERE city = 'Lahore'
  AND whatsapp_number IS NULL
ORDER BY created_at;
```

**Email Template:**

**Subject:** 🎉 Lahore is LIVE! Download Spotmate Now

**Body:**
```
Hi [Name],

Great news! Spotmate just launched in Lahore.

You joined our waitlist and you're one of the first 1,000 people - the city is now LIVE! 🎉

Download the app now and start finding activity partners:
[Play Store Link]

Whether you're looking for a tennis partner, gym buddy, or running companion - Spotmate makes it easy to find people in Lahore who want to do the same activities as you.

What's inside:
• Browse activity requests from people in Lahore
• Post what you want to do
• Match with "I'm In!"
• Chat and coordinate

See you on the court!

The Spotmate Team
Never play alone again 🎾

---
Not interested? You can unsubscribe here: [unsubscribe link]
```

---

## Step 5: Track Results

### WhatsApp Delivery Metrics

**What to track:**
- Messages sent
- Messages delivered (checkmarks)
- Messages read (blue checkmarks)
- App downloads (check Play Store stats)
- New signups in app

**Expected rates:**
- Delivery rate: 95%+ (WhatsApp is very reliable)
- Read rate: 90%+ (people check WhatsApp constantly)
- Click rate: 20-40% (of those who read it)
- Download rate: 10-20% (of total sent)

**Example:**
- 500 WhatsApp messages sent
- 475 delivered (95%)
- 425 read (90%)
- 100 clicked link (20% of readers)
- 50 downloaded app (10% of total)

**vs Email:**
- 500 emails sent
- 480 delivered (96%)
- 100 opened (20%)
- 20 clicked (4%)
- 10 downloaded (2%)

**WhatsApp is 5X more effective than email!**

---

## Step 6: Follow-Up Messages (Optional)

### Day 3 - Reminder to Non-Downloaders

```
Hey [Name]! 👋

Did you get a chance to download Spotmate yet?

Lahore is buzzing with activity! People are already posting tennis matches, gym sessions, and running groups.

Don't miss out: [link]

Quick question - what activity are you most interested in? Let me know!
```

### Week 1 - Success Stories

```
🎾 Spotmate Lahore Update!

100+ activities posted this week!
50+ people already matched!

Popular activities:
• Tennis at Tennis Club
• Gym at Fitness First
• Cricket at City Ground

Join the action: [link]
```

---

## Tips for High Engagement

### DO:
✅ Send during peak hours (6-9 PM local time)
✅ Personalize with their name
✅ Keep message short (under 200 characters)
✅ Include emoji (grabs attention)
✅ Make call-to-action clear
✅ Add urgency ("first 1,000", "launching today")

### DON'T:
❌ Send during work hours or late night
❌ Use generic "Dear User" greetings
❌ Write long paragraphs (people skim WhatsApp)
❌ Spam with multiple messages per day
❌ Forget to test message on your own phone first

---

## Legal & Privacy

### WhatsApp Business Policy

✅ Users opted-in by providing number
✅ Send only launch notifications (as promised)
✅ Provide opt-out option
✅ Don't share numbers with third parties

### Opt-Out Option

If someone replies "STOP" or "Unsubscribe":

```
No problem! You won't receive any more WhatsApp messages from Spotmate.

You're still on our email list. To remove yourself completely, email us at support@spotmate.app

Thanks for your interest! 🙏
```

Then manually remove their number from your list.

---

## Cost Comparison

| Method | Users | Cost | Time | Effectiveness |
|--------|-------|------|------|---------------|
| **WhatsApp Web (Manual)** | 100-500 | FREE | 1-2 hours | High (90% read rate) |
| **Twilio API** | 500-10k | $0.005/msg | 1 hour setup | Very High (automated) |
| **WATI** | 1k-50k | $50/month | 30 mins | Very High (dashboard) |
| **Email** | Unlimited | FREE | 30 mins | Low (20% open rate) |

---

## Sample Timeline

### City Hits 1000 Signups

**Day 1:**
- 9 AM: Export WhatsApp numbers (500 users)
- 10 AM: Export email-only addresses (500 users)
- 12 PM: Finalize message copy
- 7 PM: Start sending WhatsApp messages
- 9 PM: Finish WhatsApp (500 sent)
- Send email campaign to 500 email-only users

**Day 2:**
- Monitor WhatsApp replies
- Check app download stats
- Respond to questions

**Day 3:**
- Send reminder to non-downloaders
- Share success metrics

**Week 1:**
- 200 downloads from WhatsApp (40% conversion)
- 50 downloads from email (10% conversion)
- **Total: 250 active users!**

---

## Quick Reference

### Get WhatsApp Numbers for City
```sql
SELECT name, whatsapp_number
FROM waitlist
WHERE city = 'YOUR_CITY'
  AND whatsapp_number IS NOT NULL;
```

### Get Statistics
```sql
SELECT * FROM waitlist_city_counts
WHERE city = 'YOUR_CITY';
```

### Count WhatsApp vs Email
```sql
SELECT
  COUNT(*) as total,
  COUNT(whatsapp_number) as with_whatsapp,
  COUNT(*) - COUNT(whatsapp_number) as email_only
FROM waitlist
WHERE city = 'YOUR_CITY';
```

---

**You're ready to launch! 🚀**

WhatsApp messaging will give you 4-5X better reach than email alone. Good luck with your city launch!
