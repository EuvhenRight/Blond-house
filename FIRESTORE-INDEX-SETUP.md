# Firestore Index Setup

## Required Index

Your application requires a composite index for the `appointments` collection to query appointments by date range and status.

## Quick Setup

### Option 1: Click the Link (Easiest)

Firebase automatically provides a link when you first run the query. Click this link from the error message:

```
https://console.firebase.google.com/v1/r/project/blondhouse-d36db/firestore/indexes?create_composite=...
```

This will automatically create the required index in Firebase Console.

### Option 2: Manual Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **blondhouse-d36db**
3. Navigate to **Firestore Database** → **Indexes** tab
4. Click **Create Index**
5. Configure the index:
   - **Collection ID**: `appointments`
   - **Fields to index**:
     - Field: `status`, Order: `Ascending`
     - Field: `date`, Order: `Ascending`
   - **Query scope**: `Collection`
6. Click **Create**

### Option 3: Using firebase.json (if using Firebase CLI)

If you're using Firebase CLI, you can add this to your `firebase.json`:

```json
{
  "firestore": {
    "indexes": "firestore-indexes.json"
  }
}
```

Then run:
```bash
firebase deploy --only firestore:indexes
```

## What This Index Does

This index enables efficient queries that:
- Filter appointments by `status` (e.g., 'confirmed')
- Filter appointments by `date` range (e.g., date >= startDate AND date <= endDate)

The index is required because Firestore needs composite indexes when you have:
- Multiple `where` clauses
- Range queries (`>=`, `<=`) combined with equality queries (`==`)

## After Creating the Index

- The index creation may take a few minutes
- Once created, the error will disappear
- Your calendar will be able to load appointments efficiently

