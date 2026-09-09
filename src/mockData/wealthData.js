// Synthetic Indian Wealth Management Dataset
// Formatted according to Regional Protocol: dd-mm-yy, IST, INR (₹)

export const TEAM_MEMBERS = [
  {
    id: "rm-1",
    name: "Rahul Sharma",
    role: "Relationship Manager (Private Wealth)",
    level: "RM",
    clientsCount: 42,
    totalAUM: "₹85.0 Cr",
    openTasksCount: 5,
    slaScore: "88%",
    avatar: "RS",
    badgeColor: "bg-slate-500/20 text-slate-300 border-slate-500/30"
  },
  {
    id: "rm-2",
    name: "Priya Nair",
    role: "Relationship Manager (Affluent Banking)",
    level: "RM",
    clientsCount: 36,
    totalAUM: "₹38.2 Cr",
    openTasksCount: 4,
    slaScore: "94%",
    avatar: "PN",
    badgeColor: "bg-slate-500/20 text-slate-300 border-slate-500/30"
  },
  {
    id: "rm-3",
    name: "Vikram Mehta",
    role: "Cluster Head & Managing Director",
    level: "Manager",
    clientsCount: 18,
    totalAUM: "₹142.0 Cr",
    openTasksCount: 2,
    slaScore: "99%",
    avatar: "VM",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30"
  },
  {
    id: "ops-1",
    name: "Central Ops & Compliance",
    role: "Back-Office Processing Desk",
    level: "Operations",
    clientsCount: 96,
    totalAUM: "₹265.2 Cr",
    openTasksCount: 7,
    slaScore: "96%",
    avatar: "OPS",
    badgeColor: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30"
  }
];

export const CLIENT_PROFILES = [
  {
    id: "cli-1",
    name: "Vikramaditya Singhania",
    firmOrFamily: "Singhania Family Office",
    tier: "Ultra-HNWI",
    city: "Mumbai (Nariman Point)",
    phone: "9800011001", // placeholder demo number — replace with real CRM number in production
    assignedRMId: "rm-1",
    aumNumeric: 285000000,
    aumDisplay: "₹28.50 Cr",
    riskCategory: "Aggressive Growth",
    kycStatus: "Verified (Valid till 14-04-27)",
    mandateAllocation: {
      equity: 65,
      debt: 25,
      alternates: 10
    },
    currentAllocation: {
      equity: 78,
      debt: 14,
      alternates: 8
    },
    idleSavings: "₹45 Lakhs",
    idleSavingsRate: "3.5% p.a. (Kotak Privy)",
    taxHarvestingOpportunity: "₹6.2 Lakhs",
    portfolioHighlights: [
      { name: "Parag Parikh Flexi Cap Fund - Direct", type: "Equity MF", value: "₹6.80 Cr", returns: "+18.4% XIRR" },
      { name: "HDFC Top 100 Fund - Direct", type: "Large Cap", value: "₹4.50 Cr", returns: "+14.2% XIRR" },
      { name: "WhiteOak Capital PMS - Pioneers", type: "PMS", value: "₹5.20 Cr", returns: "+22.1% XIRR" },
      { name: "InCred Opportunities AIF Cat III", type: "AIF", value: "₹2.28 Cr", returns: "+16.8% XIRR" },
      { name: "7.18% GS 2033 Sovereign Bond", type: "G-Sec", value: "₹3.99 Cr", returns: "+7.3% YTM" },
      { name: "Nippon Small Cap ETF (Loss Harvestable)", type: "Small Cap", value: "₹1.20 Cr", returns: "-5.1% (Loss ₹6.2L)" },
      { name: "Kotak Privy Savings (Idle Cash)", type: "Liquid", value: "₹4.53 Cr", returns: "3.5% S.B." }
    ],
    clientContextNotes: "Second generation industrialist. Daughter studying at Wharton (requires USD 85,000 LRS outward remittance in Oct). Recent sale of commercial property in Gurgaon will unlock ₹4.2 Cr in 45 days.",
    relationshipMoments: [
      { date: "15-10-26", label: "Rhea's next Wharton tuition installment due" },
      { date: "12-11-26", label: "Client's birthday" }
    ],
    coPilotAlerts: [
      {
        type: "allocation_skew",
        title: "Equity Allocation 78% vs Mandate 65%",
        severity: "warning",
        description: "Portfolio is ₹3.7 Cr overweight in equities due to recent bull run. High drawdown risk if midcaps correct."
      },
      {
        type: "idle_drag",
        title: "₹45L Earning Sub-Inflation 3.5%",
        severity: "info",
        description: "Deploy into ICICI Pru Arbitrage Fund (recent ~7.2% category yield, taxed as equity rather than at slab rate) via daily STP into Large & Midcap."
      },
      {
        type: "tax_loss",
        title: "₹6.2L STCL Harvest Window",
        severity: "opportunity",
        description: "Harvest short-term capital loss in Nippon Small Cap ETF before 31-03 to offset ₹8.5L booked STCG."
      }
    ],
    talkingPoints: [
      "Congratulate on WhiteOak PMS outperforming benchmark by 380 bps this quarter.",
      "Highlight equity skew (78% vs 65% target) and propose rebalancing ₹3.7 Cr into high-yield sovereign debt / Arbitrage.",
      "Propose 6-month STP of ₹45L idle savings into Multicap strategy to hedge against market pullbacks.",
      "Remind about LRS Form A2 documentation for Wharton fee payment before the RBI limits refresh."
    ],
    objectionDefense: [
      {
        question: "Why should I book profit on equities when the market is making new highs?",
        answer: "Sir, rebalancing is not exiting the market—it's locking in gains. If Nifty drops 8%, your unhedged equity will pull down overall returns by ₹2.2 Cr. Moving ₹3.7 Cr into Arbitrage preserves your capital while continuing compounding."
      },
      {
        question: "Why not keep the ₹45L in Kotak Privy Savings for emergency liquidity?",
        answer: "Arbitrage funds offer next-day liquidity similar to savings, and are taxed as equity rather than at your income slab rate. At a recent ~7.1% category yield versus 3.5% on your Kotak Privy balance, you'd keep meaningfully more after tax — roughly ₹1.45 Lakhs more per year on this ₹45L position at the highest tax bracket, even after 20% capital gains tax on the arbitrage side."
      }
    ]
  },
  {
    id: "cli-2",
    name: "Sunita & Rajesh Goenka",
    firmOrFamily: "Goenka Family",
    tier: "HNWI CXO",
    city: "Bengaluru (Indiranagar)",
    phone: "9800011002", // placeholder demo number — replace with real CRM number in production
    assignedRMId: "rm-1",
    aumNumeric: 84000000,
    aumDisplay: "₹8.40 Cr",
    riskCategory: "Moderate Balanced",
    kycStatus: "Action Required (CAMS Re-KYC due 15-09-26)",
    mandateAllocation: {
      equity: 50,
      debt: 40,
      alternates: 10
    },
    currentAllocation: {
      equity: 42,
      debt: 48,
      alternates: 10
    },
    idleSavings: "₹35 Lakhs",
    idleSavingsRate: "3.0% p.a. (HDFC Classic)",
    taxHarvestingOpportunity: "₹1.8 Lakhs",
    portfolioHighlights: [
      { name: "Mirae Asset Large & Midcap Fund", type: "Equity MF", value: "₹2.20 Cr", returns: "+15.2% XIRR" },
      { name: "ICICI Prudential Balanced Advantage Fund", type: "Hybrid", value: "₹1.32 Cr", returns: "+12.8% XIRR" },
      { name: "HDFC Corporate Bond Fund", type: "Debt MF", value: "₹2.85 Cr", returns: "+7.8% XIRR" },
      { name: "Sovereign Gold Bonds (SGB Series IV)", type: "Gold", value: "₹0.84 Cr", returns: "+24.0% Abs" },
      { name: "HDFC Classic Savings (Idle Cash)", type: "Liquid", value: "₹1.19 Cr", returns: "3.0% S.B." }
    ],
    clientContextNotes: "Rajesh is Managing Director at a Tier-1 IT services conglomerate. Retiring in 3 years. Extremely risk-sensitive. Preoccupied with tax optimization on corporate bonuses.",
    relationshipMoments: [
      { date: "22-09-26", label: "Rajesh & Sunita's wedding anniversary" },
      { date: "2029", label: "Rajesh's planned retirement — annual review cadence should step up as this approaches" }
    ],
    coPilotAlerts: [
      {
        type: "compliance",
        title: "Urgent: CAMS Re-KYC Pending",
        severity: "critical",
        description: "Mutual fund folios will be frozen on 15-09-26 unless Aadhaar OTP re-authentication is completed."
      },
      {
        type: "underweight",
        title: "Equity Underweight (42% vs 50%)",
        severity: "warning",
        description: "Conservative bias is creating long-term inflation drag against Rajesh's planned retirement date in 2029."
      }
    ],
    talkingPoints: [
      "Clear the CAMS Re-KYC compliance obstacle in the first 2 minutes so folios remain active.",
      "Assure Rajesh that his debt portfolio (HDFC Corporate Bond) is locked in at favorable yields.",
      "Recommend allocating ₹25L bonus cash into BAF (Balanced Advantage Fund) to achieve equity upside with downside defense."
    ],
    objectionDefense: [
      {
        question: "I read IT stocks might face headwinds; why should I increase equity exposure?",
        answer: "Sir, our recommendation is not concentrated in IT. The recommended BAF fund holds less than 9% tech and automatically trims equity when valuations stretch, insulating your retirement corpus."
      }
    ]
  },
  {
    id: "cli-3",
    name: "Dr. Ananya Iyer",
    firmOrFamily: "Dr. Iyer Surgical Clinic",
    tier: "Affluent",
    city: "Chennai (Adyar)",
    phone: "9800011003", // placeholder demo number — replace with real CRM number in production
    assignedRMId: "rm-2",
    aumNumeric: 32000000,
    aumDisplay: "₹3.20 Cr",
    riskCategory: "High Growth",
    kycStatus: "Verified (Valid till 20-11-28)",
    mandateAllocation: {
      equity: 80,
      debt: 20,
      alternates: 0
    },
    currentAllocation: {
      equity: 62,
      debt: 38,
      alternates: 0
    },
    idleSavings: "₹22 Lakhs",
    idleSavingsRate: "3.5% p.a. (ICICI Bank)",
    taxHarvestingOpportunity: "₹85,000",
    portfolioHighlights: [
      { name: "Kotak Emerging Equity Fund", type: "Mid Cap MF", value: "₹1.10 Cr", returns: "+21.4% XIRR" },
      { name: "Parag Parikh Flexi Cap Fund", type: "Flexi Cap", value: "₹0.88 Cr", returns: "+19.2% XIRR" },
      { name: "ICICI Prudential All Seasons Bond", type: "Debt MF", value: "₹0.65 Cr", returns: "+7.1% XIRR" },
      { name: "Fixed Deposits & Savings", type: "Bank Cash", value: "₹0.57 Cr", returns: "5.8% Pre-tax" }
    ],
    clientContextNotes: "Chief Interventional Cardiologist. In surgery from 8:00 AM to 6:00 PM daily. Hates phone calls during clinic hours. Needs all proposals condensed into 3 bullet points via WhatsApp.",
    relationshipMoments: [
      { date: "31-03-27", label: "Clinic's financial year-end — good window to revisit tax planning" }
    ],
    coPilotAlerts: [
      {
        type: "growth_gap",
        title: "Equity 62% vs 80% Target Mandate",
        severity: "warning",
        description: "Cash accumulation from monthly clinic earnings is sitting in savings, dragging CAGR below target."
      }
    ],
    talkingPoints: [
      "Send async WhatsApp briefing with visual performance card.",
      "Propose auto-STP of ₹1.5 Lakhs/month from liquid into Kotak Emerging Equity.",
      "Offer to handle paperwork via DigiLocker sign-off so no physical signatures are needed."
    ],
    objectionDefense: [
      {
        question: "I don't have time to sign forms or review long pitch decks.",
        answer: "Doctor, you don't have to review decks. We handle 100% digital execution via WhatsApp link and one-time BSE/NSE OTP approval. Takes 20 seconds on your phone."
      }
    ]
  },
  {
    id: "cli-4",
    name: "Kabir Malhotra",
    firmOrFamily: "FinTech Founder Office",
    tier: "Emerging Tech HNWI",
    city: "Gurugram (Golf Course Rd)",
    phone: "9800011004", // placeholder demo number — replace with real CRM number in production
    assignedRMId: "rm-1",
    aumNumeric: 128000000,
    aumDisplay: "₹12.80 Cr",
    riskCategory: "Aggressive",
    kycStatus: "Verified",
    mandateAllocation: {
      equity: 70,
      debt: 15,
      alternates: 15
    },
    currentAllocation: {
      equity: 71,
      debt: 16,
      alternates: 13
    },
    idleSavings: "₹65 Lakhs",
    idleSavingsRate: "4.0% p.a. (Axis Burgundy)",
    taxHarvestingOpportunity: "₹4.5 Lakhs",
    portfolioHighlights: [
      { name: "Quant Active Fund - Direct", type: "Multi Cap", value: "₹3.80 Cr", returns: "+24.5% XIRR" },
      { name: "InCred Capital PMS", type: "PMS", value: "₹4.10 Cr", returns: "+8.6% XIRR" },
      { name: "Listed Venture Debt Notes", type: "Private Credit", value: "₹1.66 Cr", returns: "+13.5% IRR" },
      { name: "Axis Burgundy Liquid Surplus", type: "Liquid", value: "₹3.24 Cr", returns: "4.0% S.B." }
    ],
    clientContextNotes: "Recently cashed out ₹10 Cr secondary equity in Series C round. Expects another ₹2.5 Cr payout in Q3. Wants tax-efficient yields and private market deal flow.",
    relationshipMoments: [
      { date: "Q3-26", label: "Expected ₹2.5 Cr secondary payout — proactively schedule a deployment conversation" }
    ],
    coPilotAlerts: [
      {
        type: "liquidity",
        title: "Escrow Release Incoming (₹2.5 Cr)",
        severity: "opportunity",
        description: "Prepare Pre-IPO / Cat II AIF commitment deck before funds arrive."
      }
    ],
    talkingPoints: [
      "Discuss Cat II AIF private credit allocation for high post-tax yield.",
      "Execute tax-loss harvesting on Quant Active short-term loss tranches before financial year end."
    ],
    objectionDefense: [
      {
        question: "Why should I lock money in an AIF when public markets give 20%?",
        answer: "Public equities offer market beta, but Cat II private credit is structured around contractual coupons targeting a 13–14% net IRR, with far less day-to-day price movement than listed equity. It carries its own issuer and liquidity risk, like any credit exposure, but it's a way to diversify away from your concentrated tech-heavy equity position rather than a substitute for it."
      }
    ]
  }
];

export const INITIAL_TASKS = [
  {
    id: "task-101",
    title: "Arbitrage Deployment & STP Mandate (₹25 Lakhs)",
    clientId: "cli-1",
    clientName: "Vikramaditya Singhania",
    clientAUM: "₹28.5 Cr",
    clientTier: "UHNWI",
    assignedTo: "rm-1",
    assignedToName: "Rahul Sharma",
    category: "Portfolio Rebalancing",
    priority: "High",
    slaCountdown: "2h 15m",
    slaStatus: "near_breach",
    dueDate: "05-09-26 14:00",
    status: "in_progress",
    source: "Co-Pilot Recommendation",
    details: "Move ₹25L idle savings into ICICI Prudential Arbitrage Fund with daily STP of ₹50,000 into Flexi Cap."
  },
  {
    id: "task-102",
    title: "Urgent CAMS Re-KYC & PAN-Aadhaar Resync",
    clientId: "cli-2",
    clientName: "Sunita & Rajesh Goenka",
    clientAUM: "₹8.4 Cr",
    clientTier: "HNWI CXO",
    assignedTo: "ops-1",
    assignedToName: "Central Ops & Compliance",
    category: "Compliance / KYC",
    priority: "Critical",
    slaCountdown: "4h 30m",
    slaStatus: "urgent",
    dueDate: "05-09-26 16:30",
    status: "pending_ops",
    source: "Compliance Trigger (CAMS/KRA)",
    details: "Generate DigiLocker CAMS OTP re-KYC link. Ensure Rajesh validates PAN name mismatch."
  },
  {
    id: "task-103",
    title: "Wharton LRS Outward Remittance (USD 85k / ₹71L)",
    clientId: "cli-1",
    clientName: "Vikramaditya Singhania",
    clientAUM: "₹28.5 Cr",
    clientTier: "UHNWI",
    assignedTo: "ops-1",
    assignedToName: "Central Ops & Compliance",
    category: "Banking / LRS",
    priority: "Urgent",
    slaCountdown: "1d 4h",
    slaStatus: "on_track",
    dueDate: "06-09-26 18:00",
    status: "in_progress",
    source: "Client Request",
    details: "Form A2 and CA Certificate 15CB documentation for foreign education transfer via RBI LRS window."
  },
  {
    id: "task-104",
    title: "Tax-Loss Harvesting Review (Offset ₹4.5L STCG)",
    clientId: "cli-4",
    clientName: "Kabir Malhotra",
    clientAUM: "₹12.8 Cr",
    clientTier: "Emerging Tech HNWI",
    assignedTo: "rm-1",
    assignedToName: "Rahul Sharma",
    category: "Tax Optimization",
    priority: "Medium",
    slaCountdown: "2d 6h",
    slaStatus: "on_track",
    dueDate: "07-09-26 17:00",
    status: "pending_rm",
    source: "Co-Pilot Diagnostic",
    details: "Execute sale and instantaneous repurchase of loss-making ETF tranches to book tax loss before Q3 advance tax deadline."
  },
  {
    id: "task-105",
    title: "WhatsApp Monthly Briefing & STP Consent (₹1.5L/mo)",
    clientId: "cli-3",
    clientName: "Dr. Ananya Iyer",
    clientAUM: "₹3.2 Cr",
    clientTier: "Retail HNWI",
    assignedTo: "rm-2",
    assignedToName: "Priya Nair",
    category: "Client Review",
    priority: "Medium",
    slaCountdown: "6h 45m",
    slaStatus: "on_track",
    dueDate: "05-09-26 20:00",
    status: "pending_rm",
    source: "Scheduled Review",
    details: "Dispatch 3-bullet WhatsApp portfolio update at 8:00 PM IST with BSE StAR MF one-click approval link."
  },
  {
    id: "task-106",
    title: "WhiteOak PMS Dividend Re-Investment Mandate",
    clientId: "cli-1",
    clientName: "Vikramaditya Singhania",
    clientAUM: "₹28.5 Cr",
    clientTier: "UHNWI",
    assignedTo: "rm-3",
    assignedToName: "Vikram Mehta",
    category: "Mandate Execution",
    priority: "Low",
    slaCountdown: "4d 12h",
    slaStatus: "on_track",
    dueDate: "09-09-26 12:00",
    status: "completed",
    source: "Cluster Head Mandate",
    details: "Corporate action: re-invest ₹14.8L annual PMS dividend into growth allocation."
  }
];

export const DEMO_CALL_SCENARIOS = [
  {
    id: "scenario-1",
    momentType: "Liquidity Event / LRS Remittance",
    title: "Gurgaon Commercial Property Sale (₹4.2 Cr) & Arbitrage Deployment",
    // MOCK — see CONTEXT.md "Dev Build Required": scored by hand here, not by a real model
    callQuality: {
      score: 8.5,
      complianceMentioned: true,
      objectionAnticipated: true,
      tone: "Confident, consultative",
      coachingNote: "Proactively flagged LRS/15CA-CB documentation before the client asked — good practice."
    },
    clientId: "cli-1",
    clientName: "Vikramaditya Singhania",
    rawNotes: "Had a 12 min call with Vikramaditya. He confirmed he sold his commercial warehouse in Gurgaon for ₹4.2 Cr. Advance token of ₹75L received in his Kotak account today, rest ₹3.45 Cr due by 20th Oct. He is worried about market all-time highs and doesn't want to dump all into equity. Agreed to deploy ₹25L from today's cash into ICICI Arbitrage Fund immediately, then start a ₹1.5L weekly STP into Parag Parikh Flexi Cap. Also asked to send CA 15CA/CB documentation to his accountant Mr. Bansal for his daughter's Wharton tuition payment of $85,000.",
    parsedResult: {
      summary: "Client confirmed receipt of ₹75 Lakhs advance token from Gurgaon commercial property liquidation (total ₹4.2 Cr value, remaining ₹3.45 Cr expected by 20-10-26). Due to peak market caution, approved deploying ₹25L into ICICI Prudential Arbitrage Fund with weekly STP of ₹1.5L into Flexi Cap. Requested dispatch of FEMA Form 15CA/CB to CA Bansal for USD 85k Wharton fee remittance.",
      sentiment: "Bullish on liquidity, tactically cautious on high equity entry valuations",
      liquiditySignals: [
        { amount: "₹75 Lakhs", status: "Received today", asset: "Commercial Property Advance" },
        { amount: "₹3.45 Cr", status: "Expected 20-10-26", asset: "Gurgaon Property Final Tranche" }
      ],
      suitabilityGuardrail: "Arbitrage + Weekly STP aligns with the client's moderate capital deployment mandate.",
      generatedOpsTasks: [
        {
          id: "gen-task-201",
          title: "Execute ₹25L Arbitrage Purchase + ₹1.5L Weekly STP Mandate",
          assignedTo: "ops-1",
          assignedToName: "Central Ops & Compliance",
          clientName: "Vikramaditya Singhania",
          clientAUM: "₹28.5 Cr",
          clientTier: "UHNWI",
          priority: "High",
          slaCountdown: "3h 00m",
          slaStatus: "urgent",
          category: "Operations / Execution",
          status: "pending_ops"
        },
        {
          id: "gen-task-202",
          title: "Dispatch Form 15CA/CB Package to CA Bansal (bansal.ca@gmail.com)",
          assignedTo: "ops-1",
          assignedToName: "Central Ops & Compliance",
          clientName: "Vikramaditya Singhania",
          clientAUM: "₹28.5 Cr",
          clientTier: "UHNWI",
          priority: "Urgent",
          slaCountdown: "24h",
          slaStatus: "on_track",
          category: "Compliance / LRS",
          status: "pending_ops"
        }
      ],
      whatsappDraft: `Namaste Vikramaditya ji, thank you for your time today. Summary of our discussion:\n\n1. Received ₹75L property token; deploying ₹25L into ICICI Prudential Arbitrage Fund (recent ~7.1% category yield, more tax-efficient than savings) with weekly STP of ₹1.5L into Parag Parikh Flexi Cap to average valuations.\n2. Form 15CA/CB packet for Rhea's Wharton tuition ($85k) is being dispatched to CA Bansal today.\n3. We have noted the upcoming ₹3.45 Cr liquidity expected on 20-10-26 for tax-advantaged fixed income planning.\n\nWarm regards,\nRahul Sharma | Relationship Manager\nK2alpha WealthDesk`,
      emailSubject: "Summary of Portfolio Strategy & LRS Education Remittance | Vikramaditya Singhania",
      emailBody: `Dear Mr. Singhania,\n\nThank you for the update on the Gurgaon commercial property sale. Per our discussion, please find a summary below for your records:\n\n1. The ₹75 Lakh advance token has been received and ₹25 Lakhs is being deployed into ICICI Prudential Arbitrage Fund, with a ₹1.5 Lakh weekly STP into Parag Parikh Flexi Cap to average into current market levels.\n2. Form 15CA/CB for Rhea's Wharton tuition remittance (USD 85,000) is being prepared and will be sent to CA Bansal today.\n3. We have noted the remaining ₹3.45 Cr expected on 20-10-26 and will discuss tax-efficient deployment options closer to that date.\n\nPlease let us know if you have any questions.\n\nRegards,\nRahul Sharma\nRelationship Manager, K2alpha WealthDesk`,
      crmStageUpdate: "Stage: Liquidity Deployment (Pipeline +₹4.20 Cr)"
    }
  },
  {
    id: "scenario-2",
    momentType: "Market Volatility / Re-KYC Compliance",
    title: "Midcap Drawdown Panic & CAMS Re-KYC Blocker",
    // MOCK — see CONTEXT.md "Dev Build Required": scored by hand here, not by a real model
    callQuality: {
      score: 9.2,
      complianceMentioned: true,
      objectionAnticipated: true,
      tone: "Reassuring, calm",
      coachingNote: "De-escalated client anxiety with data before raising the compliance blocker — good sequencing."
    },
    clientId: "cli-2",
    clientName: "Sunita & Rajesh Goenka",
    rawNotes: "Rajesh called panicking after seeing TV headlines about midcap index falling 2.4% yesterday. Said he wants to exit his equity funds and put everything into bank FDs. I explained that his equity exposure is only 42% and well insulated. Reminded him that his goal is 2029 retirement. He calmed down. However, he mentioned his wife Sunita received an SMS from CAMS saying their folios will be blocked for Aadhaar re-KYC. Asked us to resolve this immediately before doing any new investments.",
    parsedResult: {
      summary: "Client called with high volatility anxiety following midcap market correction, expressing an urge to liquidate equities into fixed deposits. Re-anchored client to long-term 2029 retirement milestone and demonstrated that their conservative 42% equity allocation provides strong drawdown cushioning. Retained portfolio allocation. Immediate operational blocker surfaced: CAMS Re-KYC notification received by spouse Sunita Goenka requiring urgent digital resolution.",
      sentiment: "Anxious / Risk-Averse; comforted after advisor intervention",
      liquiditySignals: [
        { amount: "₹35 Lakhs", status: "Idle in HDFC Savings", asset: "Bonus payout preserved" }
      ],
      suitabilityGuardrail: "Talked client out of an equity liquidation during a market dip, keeping the long-term allocation intact.",
      generatedOpsTasks: [
        {
          id: "gen-task-203",
          title: "Trigger Instant DigiLocker Re-KYC Link for Sunita Goenka",
          assignedTo: "ops-1",
          assignedToName: "Central Ops & Compliance",
          clientName: "Sunita & Rajesh Goenka",
          clientAUM: "₹8.4 Cr",
          clientTier: "HNWI CXO",
          priority: "Critical",
          slaCountdown: "1h 30m",
          slaStatus: "near_breach",
          category: "Compliance / KYC",
          status: "pending_ops"
        }
      ],
      whatsappDraft: `Dear Rajesh ji, glad we could connect today. As discussed, your portfolio's 58% allocation to debt and gold meant yesterday's market dip had minimal impact on your position. Your 2029 retirement plan remains on track.\n\nOur operations team has just sent the secure DigiLocker Re-KYC link to Mrs. Sunita's mobile. It takes 60 seconds with Aadhaar OTP to keep all folios uninterrupted.\n\nBest regards,\nRahul Sharma | Relationship Manager\nK2alpha WealthDesk`,
      emailSubject: "Portfolio Volatility Review & Re-KYC Link | Rajesh & Sunita Goenka",
      emailBody: `Dear Rajesh and Sunita,\n\nThank you for taking the time to speak today. As discussed, your portfolio's 58% allocation to debt and gold meant yesterday's midcap correction had minimal impact on your overall position, and your 2029 retirement plan remains on track.\n\nSeparately, our operations team has sent a secure DigiLocker Re-KYC link to Sunita's registered mobile number. Completing this with Aadhaar OTP (roughly one minute) will prevent any interruption to your folios.\n\nPlease reach out if you'd like to review the allocation in more detail.\n\nRegards,\nRahul Sharma\nRelationship Manager, K2alpha WealthDesk`,
      crmStageUpdate: "Stage: Relationship Retained & Compliance Shield Active"
    }
  },
  {
    id: "scenario-3",
    momentType: "Recurring Investment Setup (STP)",
    title: "Surgeon Clinic Review & Frictionless WhatsApp STP",
    // MOCK — see CONTEXT.md "Dev Build Required": scored by hand here, not by a real model
    callQuality: {
      score: 7.8,
      complianceMentioned: false,
      objectionAnticipated: false,
      tone: "Efficient, brief",
      coachingNote: "Mandate alignment wasn't stated explicitly — worth a one-line confirmation next time."
    },
    clientId: "cli-3",
    clientName: "Dr. Ananya Iyer",
    rawNotes: "Dr. Iyer replied to WhatsApp at 8:15 PM between surgeries. She reviewed the performance card and loved that Kotak Emerging Equity did +21.4%. She agreed she has ₹22L sitting idle in her current account doing nothing. Approved starting a ₹1.5L monthly STP into Kotak and Flexi Cap. Instructed strictly: do not call her during hospital hours. Wants all transaction authorization links via BSE StAR MF WhatsApp bot so she can approve with 1 click.",
    parsedResult: {
      summary: "Doctor reviewed async portfolio health card and expressed high satisfaction with +21.4% XIRR in Midcap fund. Approved activating ₹1.5 Lakhs/month Systematic Transfer Plan (STP) from ICICI idle cash balance into Kotak Emerging Equity and Parag Parikh Flexi Cap. Reinforced strict communication protocol: zero voice calls during 8:00 AM - 6:00 PM surgical slots; all mandates routed digitally via BSE StAR MF WhatsApp verification.",
      sentiment: "Delighted with performance; values extreme execution speed and friction-free digital comms",
      liquiditySignals: [
        { amount: "₹22 Lakhs", status: "Active Current Account Balance", asset: "Clinic surplus" }
      ],
      suitabilityGuardrail: "High growth mandate with a 15+ year time horizon supports the 80% equity target allocation.",
      generatedOpsTasks: [
        {
          id: "gen-task-204",
          title: "Set up ₹1.5L/mo Multi-Fund STP on BSE StAR MF Platform",
          assignedTo: "ops-1",
          assignedToName: "Central Ops & Compliance",
          clientName: "Dr. Ananya Iyer",
          clientAUM: "₹3.2 Cr",
          clientTier: "Retail HNWI",
          priority: "High",
          slaCountdown: "4h 00m",
          slaStatus: "urgent",
          category: "Operations / STP",
          status: "pending_ops"
        }
      ],
      whatsappDraft: `Dear Dr. Iyer, thank you for your quick WhatsApp approval!\n\nWe have configured your ₹1.5L/month STP (₹75k Kotak Emerging Equity + ₹75k Parag Parikh Flexi Cap). Here is your 1-click BSE StAR MF authorization link: https://bsestarmf.in/star/auth/782910\n\nNo calls during your surgical hours—we will notify you once units are credited on Monday.\n\nWarm regards,\nPriya Nair | Relationship Manager\nK2alpha WealthDesk`,
      emailSubject: "STP Mandate Setup Confirmation | Dr. Ananya Iyer",
      emailBody: `Dear Dr. Iyer,\n\nThank you for reviewing the portfolio summary and confirming the next step. We have set up a ₹1.5 Lakh/month Systematic Transfer Plan, split ₹75,000 into Kotak Emerging Equity and ₹75,000 into Parag Parikh Flexi Cap, funded from the idle balance in your current account.\n\nThe BSE StAR MF authorization link has been sent to you via WhatsApp for one-click approval. As agreed, we will not call during your surgical hours and will confirm once units are credited.\n\nRegards,\nPriya Nair\nRelationship Manager, K2alpha WealthDesk`,
      crmStageUpdate: "Stage: Mandate Active (Monthly Inflow ₹1.50 Lakhs)"
    }
  }
];

export const FIRM_METRICS = {
  totalAUM: "₹265.2 Cr",
  activeClients: 96,
  rmsCount: 4,
  tasksDueToday: 12,
  nearBreachSLAs: 2,
  crmHygieneScore: "94.8%",
  unallocatedCashAcrossClients: "₹2.85 Cr",
  taxLossHarvestableWindow: "₹18.4 Lakhs"
};

// House View Reference Library — MOCK, see CONTEXT.md "Dev Build Required".
// This is the honest alternative to a live "ask anything" AI bot: a small, dated,
// versioned set of notes an RM can point a client to, instead of freelancing an
// answer to a macro/geopolitical question. In production this must be sourced from
// the firm's actual, compliance-approved research desk output — never generated live.
export const HOUSE_VIEWS = [
  {
    id: "hv-1",
    title: "Global Equity & Macro Outlook",
    approvedBy: "Investment Committee",
    lastReviewed: "01-09-26",
    tags: ["Equities", "Macro"],
    summary: "Our base case remains constructive on Indian equities over a 3-5 year horizon, driven by domestic consumption and capex. We expect episodic volatility from global rate cycles and geopolitical events, and recommend clients stay invested through drawdowns rather than timing re-entry, consistent with their mandate allocation.",
  },
  {
    id: "hv-2",
    title: "Fixed Income & Interest Rate Trajectory",
    approvedBy: "Investment Committee",
    lastReviewed: "01-09-26",
    tags: ["Debt", "Rates"],
    summary: "We favor high-quality short-to-medium duration debt over long-duration bets given rate uncertainty. Clients with near-term goals should stay in shorter maturities; longer-horizon allocations can selectively add duration on meaningful yield spikes.",
  },
  {
    id: "hv-3",
    title: "Geopolitical Risk & Portfolio Hedging",
    approvedBy: "Investment Committee",
    lastReviewed: "01-09-26",
    tags: ["Geopolitics", "Hedging"],
    summary: "Geopolitical shocks typically produce short-term volatility rather than durable shifts in fundamentals for diversified Indian portfolios. Our standing guidance: maintain existing gold/alternates hedges per mandate, avoid reactive selling into a single news event, and revisit allocation only if a client's own mandate or time horizon has genuinely changed — not in response to headlines alone.",
  },
  {
    id: "hv-4",
    title: "Gold & Alternates Allocation View",
    approvedBy: "Investment Committee",
    lastReviewed: "01-09-26",
    tags: ["Gold", "Alternates"],
    summary: "We continue to recommend a 5-15% strategic allocation to gold and alternates as a portfolio stabilizer, independent of near-term price moves. This is a structural diversification position, not a tactical call on the gold price.",
  }
];

// Broader taxonomy of recurring Indian wealth-advisory moments. Only the 3 above have
// full interactive demo scenarios built out; the rest are named here to show the intended
// scope of the playbook library, honestly marked as not yet built rather than faked.
export const PLAYBOOK_LIBRARY = [
  { momentType: "Liquidity Event / LRS Remittance", status: "demo", scenarioId: "scenario-1" },
  { momentType: "Market Volatility / Re-KYC Compliance", status: "demo", scenarioId: "scenario-2" },
  { momentType: "Recurring Investment Setup (STP)", status: "demo", scenarioId: "scenario-3" },
  { momentType: "Tax-Year-End Harvesting", status: "coming_soon" },
  { momentType: "ELSS Lock-In Expiry", status: "coming_soon" },
  { momentType: "Bonus / Diwali Season Liquidity", status: "coming_soon" },
  { momentType: "NPS / EPF Nomination Update", status: "coming_soon" }
];
