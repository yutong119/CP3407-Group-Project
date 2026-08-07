# Recommended Test Cases

These test cases are designed to demonstrate that SafeStay uses OpenAI to understand natural-language incident descriptions, while the backend retrieves stable recommendations, evidence checklist items, and authority contacts from the database.

## 1. Rental Dispute

Input:

The property owner kept the money I paid before moving in because they claim I damaged the apartment.

Expected result:

- Detected Case: Rental Dispute
- Urgency Level: Medium
- Database content should include rental agreement, payment records, property photos, and legal-aid guidance.

## 2. Scam / Online Fraud

Input:

Someone pretending to be a bank officer asked me to transfer money to a secure account, and I later realised the call was fake.

Expected result:

- Detected Case: Scam / Online Fraud
- Urgency Level: High
- Database content should include transaction records, screenshots, bank contact guidance, and fraud-related recommendations.

## 3. Lost Passport

Input:

I cannot find my travel document after arriving at Changi Airport, and I have a flight in two days.

Expected result:

- Detected Case: Lost Passport
- Urgency Level: High
- Database content should include passport copy, police report, embassy information, and travel itinerary.

## 4. Theft

Input:

When I returned to my table in the library, my backpack containing my wallet and laptop was gone.

Expected result:

- Detected Case: Theft
- Urgency Level: High
- Database content should include CCTV, witness information, proof of ownership, and police guidance.

## 5. Medical Emergency

Input:

My roommate is having difficulty breathing and feels severe chest pain.

Expected result:

- Detected Case: Medical Emergency
- Urgency Level: High
- Emergency contacts should be displayed.
- SafeStay does not provide a medical diagnosis.

## 6. Other Issues

Input:

My university access card has stopped working and I am not sure which department I should contact.

Expected result:

- Detected Case: Other Issues
- The system should not force the description into an unrelated category.

## Recommended Lecturer Demo

For a short demonstration, test:

1. Rental Dispute — demonstrates semantic understanding without obvious keywords.
2. Scam / Online Fraud or Lost Passport — demonstrates category-specific database results.
3. Other Issues — demonstrates fallback classification.

## System Behaviour

OpenAI is responsible for:

- understanding the user description
- selecting one of the six supported categories
- estimating urgency and confidence
- optionally generating a formal summary

The database is responsible for:

- recommended actions
- evidence checklist templates
- verified authority contacts

The system also retains rule-based fallback if OpenAI is unavailable.