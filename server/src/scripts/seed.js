import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import {
  Campus,
  User,
  AcademicTerm,
  Club,
  Membership,
  Event,
  EventTask,
  EventTemplate,
  Approval,
  KnowledgeItem,
  Contact,
  Decision,
  Handover,
  Notification,
  AuditLog,
} from '../models/index.js';

export async function runSeed() {
  console.log('[Seed] Starting database seeding...');
  await connectDB();

  // Clear existing collections
  await Promise.all([
    Campus.deleteMany({}),
    User.deleteMany({}),
    AcademicTerm.deleteMany({}),
    Club.deleteMany({}),
    Membership.deleteMany({}),
    Event.deleteMany({}),
    EventTask.deleteMany({}),
    EventTemplate.deleteMany({}),
    Approval.deleteMany({}),
    KnowledgeItem.deleteMany({}),
    Contact.deleteMany({}),
    Decision.deleteMany({}),
    Handover.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  const defaultPasswordHash = await bcrypt.hash('Password123!', 12);

  // 1. Create Campuses
  const pcu = await Campus.create({
    name: 'Pacific Coast University',
    slug: 'pcu',
    domain: 'pcu.edu',
    location: 'San Francisco, CA',
    settings: {
      allowSelfRegistration: true,
      requireFacultyApprovalForEvents: true,
      defaultAcademicYear: '2025-2026',
    },
  });

  const mti = await Campus.create({
    name: 'Metro Tech Institute',
    slug: 'mti',
    domain: 'mti.edu',
    location: 'Boston, MA',
    settings: {
      allowSelfRegistration: true,
      requireFacultyApprovalForEvents: true,
      defaultAcademicYear: '2025-2026',
    },
  });

  console.log(`[Seed] Created 2 Campuses: ${pcu.name}, ${mti.name}`);

  // 2. Create Academic Terms
  const pcuPastTerm = await AcademicTerm.create({
    campusId: pcu._id,
    name: '2024-2025',
    startDate: new Date('2024-09-01'),
    endDate: new Date('2025-06-30'),
    isCurrent: false,
  });

  const pcuCurrentTerm = await AcademicTerm.create({
    campusId: pcu._id,
    name: '2025-2026',
    startDate: new Date('2025-09-01'),
    endDate: new Date('2026-06-30'),
    isCurrent: true,
  });

  const pcuNextTerm = await AcademicTerm.create({
    campusId: pcu._id,
    name: '2026-2027',
    startDate: new Date('2026-09-01'),
    endDate: new Date('2027-06-30'),
    isCurrent: false,
  });

  const mtiCurrentTerm = await AcademicTerm.create({
    campusId: mti._id,
    name: '2025-2026',
    startDate: new Date('2025-09-01'),
    endDate: new Date('2026-06-30'),
    isCurrent: true,
  });

  // 3. Create Users for PCU
  const pcuAdmin = await User.create({
    campusId: pcu._id,
    fullName: 'Dean Marcus Vance',
    email: 'admin@pcu.edu',
    passwordHash: defaultPasswordHash,
    campusRole: 'CAMPUS_ADMIN',
    department: 'Office of Student Affairs',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  });

  const facultyChen = await User.create({
    campusId: pcu._id,
    fullName: 'Dr. Evelyn Chen',
    email: 'advisor.chen@pcu.edu',
    passwordHash: defaultPasswordHash,
    campusRole: 'FACULTY_COORDINATOR',
    department: 'Computer Science & Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  });

  const sarahPresident = await User.create({
    campusId: pcu._id,
    fullName: 'Sarah Jenkins (Outgoing)',
    email: 'sarah.gdg@pcu.edu',
    passwordHash: defaultPasswordHash,
    campusRole: 'STUDENT',
    department: 'Computer Science, Class of 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  });

  const alexIncoming = await User.create({
    campusId: pcu._id,
    fullName: 'Alex Rivera (Incoming)',
    email: 'alex.incoming@pcu.edu',
    passwordHash: defaultPasswordHash,
    campusRole: 'STUDENT',
    department: 'Software Engineering, Class of 2027',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  });

  const davidSecretary = await User.create({
    campusId: pcu._id,
    fullName: 'David Kalu',
    email: 'david.sec@pcu.edu',
    passwordHash: defaultPasswordHash,
    campusRole: 'STUDENT',
    department: 'Data Science, Class of 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  });

  const mayaLead = await User.create({
    campusId: pcu._id,
    fullName: 'Maya Patel',
    email: 'maya.tech@pcu.edu',
    passwordHash: defaultPasswordHash,
    campusRole: 'STUDENT',
    department: 'Computer Science, Class of 2027',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
  });

  const rajIEEE = await User.create({
    campusId: pcu._id,
    fullName: 'Rajesh Sharma',
    email: 'raj.ieee@pcu.edu',
    passwordHash: defaultPasswordHash,
    campusRole: 'STUDENT',
    department: 'Electrical Engineering, Class of 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
  });

  // Users for MTI (Tenant Isolation test)
  const mtiAdmin = await User.create({
    campusId: mti._id,
    fullName: 'Dean Robert Taylor',
    email: 'admin@mti.edu',
    passwordHash: defaultPasswordHash,
    campusRole: 'CAMPUS_ADMIN',
    department: 'Student Affairs',
  });

  const elenaAWS = await User.create({
    campusId: mti._id,
    fullName: 'Elena Rostova',
    email: 'elena.aws@mti.edu',
    passwordHash: defaultPasswordHash,
    campusRole: 'STUDENT',
    department: 'Cloud Computing, Class of 2026',
  });

  console.log(`[Seed] Created test users across both campuses`);

  // 4. Create Clubs for PCU
  const gdgClub = await Club.create({
    campusId: pcu._id,
    facultyCoordinatorId: facultyChen._id,
    name: 'Google Developer Group on Campus',
    code: 'GDG',
    category: 'TECHNICAL',
    description: 'University chapter connecting student developers with Google technologies, open source, and web/cloud architecture.',
    logoUrl: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120',
    status: 'ACTIVE',
  });

  const ieeeClub = await Club.create({
    campusId: pcu._id,
    facultyCoordinatorId: facultyChen._id,
    name: 'IEEE Student Branch',
    code: 'IEEE',
    category: 'TECHNICAL',
    description: 'Fostering technological innovation and excellence for the benefit of humanity through robotics and embedded systems.',
    status: 'ACTIVE',
  });

  const acmClub = await Club.create({
    campusId: pcu._id,
    facultyCoordinatorId: facultyChen._id,
    name: 'ACM Student Chapter',
    code: 'ACM',
    category: 'ACADEMIC',
    description: 'Premier student computing society advancing algorithmic thinking, research seminars, and competitive programming.',
    status: 'ACTIVE',
  });

  // MTI Club
  const awsClub = await Club.create({
    campusId: mti._id,
    name: 'AWS Cloud Club',
    code: 'AWSCC',
    category: 'TECHNICAL',
    description: 'Student-led community supported by AWS to build cloud skills and certifications.',
    status: 'ACTIVE',
  });

  console.log(`[Seed] Created Clubs: GDG, IEEE, ACM (PCU) and AWSCC (MTI)`);

  // 5. Create Memberships
  await Membership.create([
    {
      campusId: pcu._id,
      clubId: gdgClub._id,
      userId: sarahPresident._id,
      academicTermId: pcuCurrentTerm._id,
      clubRole: 'PRESIDENT',
      title: 'Club President (Outgoing)',
      status: 'ACTIVE',
    },
    {
      campusId: pcu._id,
      clubId: gdgClub._id,
      userId: alexIncoming._id,
      academicTermId: pcuCurrentTerm._id,
      clubRole: 'CORE_TEAM',
      title: 'Vice President & President-Elect',
      status: 'ACTIVE',
    },
    {
      campusId: pcu._id,
      clubId: gdgClub._id,
      userId: davidSecretary._id,
      academicTermId: pcuCurrentTerm._id,
      clubRole: 'SECRETARY',
      title: 'General Secretary',
      status: 'ACTIVE',
    },
    {
      campusId: pcu._id,
      clubId: gdgClub._id,
      userId: mayaLead._id,
      academicTermId: pcuCurrentTerm._id,
      clubRole: 'CORE_TEAM',
      title: 'Technical Workshop Lead',
      status: 'ACTIVE',
    },
    {
      campusId: pcu._id,
      clubId: ieeeClub._id,
      userId: rajIEEE._id,
      academicTermId: pcuCurrentTerm._id,
      clubRole: 'PRESIDENT',
      title: 'Branch Chairperson',
      status: 'ACTIVE',
    },
    {
      campusId: mti._id,
      clubId: awsClub._id,
      userId: elenaAWS._id,
      academicTermId: mtiCurrentTerm._id,
      clubRole: 'PRESIDENT',
      title: 'Captain',
      status: 'ACTIVE',
    },
  ]);

  // 6. Create Event Templates
  await EventTemplate.create([
    {
      name: 'Technical Workshop',
      eventType: 'WORKSHOP',
      defaultDescription: 'Hands-on coding session covering a modern framework or developer tool with guided coding exercises.',
      recommendedBudgetTier: 'LOW',
      defaultTasks: [
        { title: 'Secure Computer Lab & Projector AV', leadDaysBefore: 14, priority: 'HIGH' },
        { title: 'Prepare GitHub Starter Repository & Slides', leadDaysBefore: 7, priority: 'HIGH' },
        { title: 'Publish Campus RSVP & Discord Announcement', leadDaysBefore: 10, priority: 'MEDIUM' },
        { title: 'Order Refreshments / Snacks', leadDaysBefore: 3, priority: 'MEDIUM' },
        { title: 'Test Lab Internet & WiFi Access Codes', leadDaysBefore: 1, priority: 'URGENT' },
      ],
    },
    {
      name: '48-Hour Hackathon',
      eventType: 'HACKATHON',
      defaultDescription: 'Full-scale weekend innovation sprint with corporate mentors, tiered tracks, and judging panel.',
      recommendedBudgetTier: 'HIGH',
      defaultTasks: [
        { title: 'Submit University Facilities & Overnight Security Permit', leadDaysBefore: 45, priority: 'URGENT' },
        { title: 'Finalize Title & Gold Sponsors Agreement', leadDaysBefore: 30, priority: 'HIGH' },
        { title: 'Contract Catering Vendor for 4 Meal Cycles', leadDaysBefore: 20, priority: 'HIGH' },
        { title: 'Procure Hardware Kits & Swag Badges', leadDaysBefore: 14, priority: 'MEDIUM' },
        { title: 'Brief Judging Panel & Scoring Rubric', leadDaysBefore: 5, priority: 'MEDIUM' },
      ],
    },
    {
      name: 'Guest Lecture / Industry Keynote',
      eventType: 'GUEST_LECTURE',
      defaultDescription: 'Invited tech industry executive or researcher sharing real-world insights and career advice.',
      recommendedBudgetTier: 'MEDIUM',
      defaultTasks: [
        { title: 'Confirm Speaker Date & Travel Accommodations', leadDaysBefore: 21, priority: 'HIGH' },
        { title: 'Book Main Auditorium with Facilities', leadDaysBefore: 14, priority: 'HIGH' },
        { title: 'Draft Honorarium Paperwork for Faculty Advisor', leadDaysBefore: 10, priority: 'HIGH' },
        { title: 'Record Session and Coordinate Q&A Mics', leadDaysBefore: 1, priority: 'MEDIUM' },
      ],
    },
  ]);

  // 7. Create Events for GDG Club
  const pastDevFest = await Event.create({
    campusId: pcu._id,
    clubId: gdgClub._id,
    academicTermId: pcuCurrentTerm._id,
    leadOrganizerId: sarahPresident._id,
    title: 'GDG DevFest Pacific 2025',
    description: 'Annual premier developer festival featuring talks on Generative AI, Cloud Run, and Flutter multiplatform.',
    eventType: 'WORKSHOP',
    status: 'COMPLETED',
    startDate: new Date('2025-10-15T09:00:00Z'),
    endDate: new Date('2025-10-15T18:00:00Z'),
    venueName: 'Engineering Science Auditorium Hall A',
    venueCapacity: 350,
    estimatedBudget: 3200,
    actualBudget: 3050,
    expectedAttendance: 250,
    actualAttendance: 285,
    tags: ['Google Cloud', 'AI', 'Flutter', 'DevFest'],
    retrospective: {
      summary: 'Exceptional turnout exceeding RSVP limit by 14%. Keynote on Gemini Interactions was standing room only.',
      whatWentWell: 'Audio-visual team was on point; lunch box distribution finished within 30 minutes; sponsor table engagement was high.',
      whatCouldImprove: 'Auditorium guest WiFi dropped during live codealong. Must request dedicated SSID from Campus IT 3 weeks in advance next time.',
      keyMetrics: '285 attendees, 18 project demos submitted, 4 corporate sponsors satisfied.',
      sponsorSatisfaction: 'Google Cloud team rated event 9.5/10 and committed $1,500 renewal for next year.',
      completedAt: new Date('2025-10-18'),
    },
  });

  const upcomingWorkshop = await Event.create({
    campusId: pcu._id,
    clubId: gdgClub._id,
    academicTermId: pcuCurrentTerm._id,
    leadOrganizerId: mayaLead._id,
    title: 'Production Kubernetes & Docker Workshop',
    description: 'Hands-on architectural lab deploying containerized microservices with zero-downtime rolling updates.',
    eventType: 'WORKSHOP',
    status: 'PLANNING',
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // in 10 days
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 4 * 3600 * 1000),
    venueName: 'Computer Science Lab 304',
    venueCapacity: 60,
    estimatedBudget: 450,
    expectedAttendance: 55,
    tags: ['DevOps', 'Kubernetes', 'Docker'],
  });

  const proposedHackathon = await Event.create({
    campusId: pcu._id,
    clubId: gdgClub._id,
    academicTermId: pcuCurrentTerm._id,
    leadOrganizerId: alexIncoming._id,
    title: 'CodeForward Hackathon 2026',
    description: '36-hour intercollegiate hackathon focusing on AI agents for climate resilience and healthcare accessibility.',
    eventType: 'HACKATHON',
    status: 'PROPOSED',
    startDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // in 35 days
    endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000),
    venueName: 'Student Union Grand Ballroom',
    venueCapacity: 400,
    estimatedBudget: 6500,
    expectedAttendance: 300,
    tags: ['Hackathon', 'AI', 'Intercollegiate'],
  });

  // 8. Create Tasks for upcoming workshop
  const task1 = await EventTask.create({
    campusId: pcu._id,
    clubId: gdgClub._id,
    eventId: upcomingWorkshop._id,
    assigneeId: mayaLead._id,
    title: 'Prepare Dockerfile & Kubernetes manifests repo',
    description: 'Ensure student machines can pull the base images without Docker Hub rate-limits.',
    status: 'DONE',
    priority: 'HIGH',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  });

  const task2 = await EventTask.create({
    campusId: pcu._id,
    clubId: gdgClub._id,
    eventId: upcomingWorkshop._id,
    assigneeId: davidSecretary._id,
    title: 'Verify Lab 304 projector and audio setup',
    description: 'Check HDMI dongles and wireless lavalier microphone with IT department.',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    prerequisiteTaskIds: [task1._id],
  });

  const task3 = await EventTask.create({
    campusId: pcu._id,
    clubId: gdgClub._id,
    eventId: upcomingWorkshop._id,
    assigneeId: alexIncoming._id,
    title: 'Publish reminder announcement & registration check-in links',
    description: 'Send reminder email to 60 registered attendees with pre-requisite installations.',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    prerequisiteTaskIds: [task2._id],
  });

  // 9. Create Approval Record for the Proposed Hackathon
  const proposalApproval = await Approval.create({
    campusId: pcu._id,
    clubId: gdgClub._id,
    eventId: proposedHackathon._id,
    reviewerId: facultyChen._id,
    decision: 'PENDING',
    comments: 'Awaiting updated overnight safety protocol and revised security guard quote.',
    decidedAt: new Date(),
    revisionNumber: 1,
  });

  // 10. Create Organization Memory (KnowledgeItems)
  const sopVenue = await KnowledgeItem.create({
    campusId: pcu._id,
    clubId: gdgClub._id,
    academicTermId: pcuCurrentTerm._id,
    authorId: sarahPresident._id,
    title: 'SOP: Booking University Auditoriums & Security Permits',
    category: 'SOP',
    tags: ['Auditorium', 'Facilities', 'Permits', 'Safety'],
    version: 2,
    content: `### Purpose
This Standard Operating Procedure explains how to officially reserve large campus spaces (e.g. Science Auditorium A, Student Union Ballroom) for technical events exceeding 100 attendees.

### Lead Time Requirement
All formal requests must be submitted **at least 28 days prior** to the proposed event date.

### Step-by-Step Procedure:
1. **Dean Approval:** First gain written endorsement from Faculty Advisor (Dr. Evelyn Chen).
2. **Facilities Work Order:** Navigate to \`facilities.pcu.edu/request\` and select category "Student Organization Activity".
3. **Campus Police Notification:** If the event runs past 9:00 PM or welcomes external non-student attendees, Campus Safety requires a security detail quote.
4. **AV Services Confirmation:** Contact Media Services (\`av@pcu.edu\`) with microphone, livestream, and stage lighting requirements.
5. **Trash & Custodial:** Deposit $150 custodial reserve to account #4088.

### Key Gotchas:
- Do NOT bring outside food without submitting the Approved Caterer Waiver form.
- The Science Auditorium audio mixer only accepts XLR and balanced 1/4 inch jacks. Bring the club adapter kit located in Office 214.`,
    revisionHistory: [
      {
        version: 1,
        editedById: sarahPresident._id,
        editedAt: new Date('2024-11-10'),
        changeSummary: 'Initial draft for 2024 academic year',
      },
      {
        version: 2,
        editedById: sarahPresident._id,
        editedAt: new Date('2025-09-15'),
        changeSummary: 'Updated custodial deposit amount and added AV adapter details',
      },
    ],
  });

  const sopHackathon = await KnowledgeItem.create({
    campusId: pcu._id,
    clubId: gdgClub._id,
    academicTermId: pcuCurrentTerm._id,
    authorId: sarahPresident._id,
    title: 'Hackathon Organizing Playbook: WiFi, Catering & Sponsor Relations',
    category: 'EVENT_PLAYBOOK',
    tags: ['Hackathon', 'Sponsors', 'WiFi', 'Operations'],
    version: 1,
    content: `### Hackathon Master Execution Guide

#### 1. WiFi & Network Infrastructure (Critical Failure Point)
Never rely on standard university eduroam for 300 simultaneous developers pushing Git repos.
- Submit a ticket to Campus Network Operations (\`netops@pcu.edu\`) asking for an isolated event SSID with uncapped bandwidth.
- Request 4 physical hardwired Cat6 drops for the judging and livestream stage.

#### 2. Sponsor Deliverable Checklist
- Logo on website header, stage banner, and t-shirts.
- Dedicated 10x10 booth space with 2 chairs and power strip.
- 5-minute opening ceremony stage intro.
- Resume drop folder access delivered strictly within 48 hours post-event.

#### 3. Meal Logistics
- Plan for 35% vegetarian, 15% vegan, 20% halal/kosher options.
- Midnight snacks (energy drinks, fruit, bagels) are mandatory for overnight momentum.`,
  });

  // 11. Create Contacts (Sponsors & Vendors)
  const contactGoogle = await Contact.create({
    campusId: pcu._id,
    clubId: gdgClub._id,
    contactType: 'SPONSOR',
    organizationName: 'Google Cloud Student Programs',
    primaryContactName: 'Marcus Lindqvist (University Outreach)',
    email: 'marcus.l@google-outreach-example.com',
    phone: '+1 (415) 555-0192',
    servicesOffered: 'Annual club cash sponsorship, Google Cloud credits ($50/student), and branded merchandise.',
    pricingNotes: 'Grants $1,500 - $3,000 depending on event scope. Invoices require 45-day Net payment cycle.',
    leadTimeDays: 30,
    rating: 5,
    notes: 'Very responsive. Marcus prefers email communication and requires event photos with attendance metrics for reimbursement.',
  });

  const contactVendor = await Contact.create({
    campusId: pcu._id,
    clubId: gdgClub._id,
    contactType: 'VENDOR',
    organizationName: 'Bay Area Screen Printing & Swag Co.',
    primaryContactName: 'Elena Torres',
    email: 'orders@bayscreenprint-example.com',
    phone: '+1 (415) 555-0844',
    servicesOffered: 'Custom embroidered hoodies, screen-printed t-shirts, laser-cut acrylic badges, and die-cut vinyl stickers.',
    pricingNotes: '100 t-shirts at $7.50/unit; 48-hour rush fee is 20%. Student organization discount: 10% code "PCU-STUDENTS".',
    leadTimeDays: 10,
    rating: 5,
    notes: 'Best local vendor. Delivers directly to Campus Mailroom. Always verify artwork vector proofs.',
  });

  // 12. Create Decisions
  await Decision.create({
    campusId: pcu._id,
    clubId: gdgClub._id,
    academicTermId: pcuCurrentTerm._id,
    recordedById: davidSecretary._id,
    title: 'Approval of Spring 2026 Budget & Transition Timeline',
    summary: 'Executive committee voted unanimously to allocate $2,000 to CodeForward Hackathon and established March 15 as the deadline for leadership handover completion.',
    meetingDate: new Date('2026-02-01'),
    attendees: [
      { name: 'Sarah Jenkins', role: 'President' },
      { name: 'Alex Rivera', role: 'VP' },
      { name: 'David Kalu', role: 'Secretary' },
      { name: 'Maya Patel', role: 'Technical Lead' },
    ],
    outcome: 'APPROVED',
    actionItems: [
      { task: 'Submit CodeForward proposal to Dr. Evelyn Chen', owner: 'Alex Rivera', deadline: new Date('2026-02-15') },
      { task: 'Begin drafting Handover Package in ClubRelay', owner: 'Sarah Jenkins', deadline: new Date('2026-02-28') },
    ],
  });

  // 13. Create Handover Package (The Core Feature Showcase!)
  const sampleHandover = await Handover.create({
    campusId: pcu._id,
    clubId: gdgClub._id,
    fromTermId: pcuCurrentTerm._id,
    toTermId: pcuNextTerm._id,
    outgoingLeaderId: sarahPresident._id,
    incomingLeaderId: alexIncoming._id,
    roleHandover: 'PRESIDENT',
    status: 'IN_REVIEW',
    sections: {
      roleResponsibilities: {
        content: `As President of GDG on Campus:
1. Primary spokesperson representing the club to the University Student Affairs Council and Dr. Evelyn Chen.
2. Chair weekly Sunday 6:00 PM executive committee syncs and set the organizational vision.
3. Manage the annual $7,500 operating budget and maintain final sign-off on all disbursements.
4. Maintain communication with our Google Regional Developer Community Lead.`,
        completed: true,
      },
      outstandingTasks: {
        content: `Immediate obligations for the incoming term:`,
        taskList: [
          { task: 'Collect $1,500 Google Cloud sponsorship check for DevFest 2025 reimbursement', status: 'Pending Accounts Payable', deadline: '2026-03-30' },
          { task: 'Re-register student organization paperwork with Student Affairs by April 10', status: 'Not Started', deadline: '2026-04-10' },
        ],
        completed: true,
      },
      pendingCommitments: {
        content: `Existing agreements that carry over into next term:`,
        commitments: [
          { title: 'Bay Area Screen Printing credit balance', party: 'Bay Area Screen Printing', notes: '$180 account credit remains from overpayment on Fall stickers.' },
          { title: 'Auditorium booking hold for DevFest 2026', party: 'Campus Facilities', notes: 'Tentative reservation placed for October 17, 2026.' },
        ],
        completed: true,
      },
      futureEventSchedules: {
        content: `Tentative calendar agreed upon with Faculty Advisor:`,
        schedules: [
          { eventTitle: 'Fall 2026 Developer Welcome Mixer', tentativeDate: '2026-09-12', venue: 'Student Union Lawn' },
          { eventTitle: 'DevFest Pacific 2026', tentativeDate: '2026-10-17', venue: 'Science Auditorium Hall A' },
        ],
        completed: true,
      },
      importantDocuments: {
        content: `Official club resources and storage vaults:`,
        links: [
          { label: 'Official Club Constitution & Bylaws', url: 'https://drive.google.com/example/constitution', description: 'Updated with faculty advisor signature' },
          { label: 'Branding Vector Assets & Slide Deck Kit', url: 'https://drive.google.com/example/brand-kit', description: 'Google Developer Group official vectors and fonts' },
          { label: 'Bitwarden Club Shared Vault Access', url: 'https://vault.bitwarden.com/#/organizations/example', description: 'Secure credential ownership transfer for official domain and Twitter account' },
        ],
        completed: true,
      },
      contactsAndPartners: {
        content: `Key external stakeholders and advisors to preserve relationships with.`,
        contactIds: [contactGoogle._id, contactVendor._id],
        completed: true,
      },
      reusablePlaybooks: {
        content: `Standard Operating Procedures that must be followed for campus compliance.`,
        playbookIds: [sopVenue._id, sopHackathon._id],
        completed: true,
      },
      recommendationsAndAdvice: {
        content: `Advice from Sarah (Outgoing President) to Alex (Incoming President):
- Always loop in Dr. Chen at least 3 weeks before asking for money or university space. She is very supportive if informed early, but hates surprise fire drills.
- Do not let Core Leads work in silos. Pair new first-year leads with experienced seniors for their first event.
- Preserve our relationship with Marcus at Google; he cares deeply about high-quality student testimonials and photos with diverse participation.
- You have an incredible team. Trust them, delegate early, and enjoy the journey!`,
        completed: true,
      },
    },
    completionPercentage: 100,
    reviewNotes: 'Alex has reviewed sections 1 through 7 and requested clarification on the Bitwarden vault ownership transfer.',
    acknowledgedAt: null,
  });

  // 14. Notifications
  await Notification.create([
    {
      campusId: pcu._id,
      userId: facultyChen._id,
      title: 'New Event Proposal Submitted',
      message: 'GDG submitted "CodeForward Hackathon 2026" for your faculty review and safety approval.',
      type: 'APPROVAL',
      link: `/faculty/approvals`,
    },
    {
      campusId: pcu._id,
      userId: alexIncoming._id,
      title: 'Handover Package Ready for Review',
      message: 'Sarah Jenkins has finalized the Presidential Handover Package for your formal acknowledgment.',
      type: 'HANDOVER',
      link: `/clubs/${gdgClub._id}/handover`,
    },
    {
      campusId: pcu._id,
      userId: mayaLead._id,
      title: 'Task Assigned',
      message: 'You were assigned to "Prepare Dockerfile & Kubernetes manifests repo".',
      type: 'TASK',
      link: `/clubs/${gdgClub._id}/events/${upcomingWorkshop._id}/tasks`,
    },
  ]);

  // 15. Audit Log Entry
  await AuditLog.create([
    {
      campusId: pcu._id,
      clubId: gdgClub._id,
      actorId: sarahPresident._id,
      action: 'HANDOVER_SECTIONS_UPDATED',
      targetType: 'Handover',
      targetId: sampleHandover._id,
      metadata: { completedSections: 8, percentage: 100 },
      ipAddress: '127.0.0.1',
    },
    {
      campusId: pcu._id,
      clubId: gdgClub._id,
      actorId: alexIncoming._id,
      action: 'EVENT_PROPOSED',
      targetType: 'Event',
      targetId: proposedHackathon._id,
      metadata: { title: 'CodeForward Hackathon 2026', estimatedBudget: 6500 },
      ipAddress: '127.0.0.1',
    },
  ]);

  console.log('[Seed] Database successfully populated with realistic multi-tenant data!');
  console.log(`[Seed] Seeded 2 campuses, 4 clubs, 8 users, 3 events, 3 tasks, 2 SOPs, 2 contacts, and 1 complete Handover.`);
}

// Run directly if script is executed
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeed()
    .then(async () => {
      console.log('[Seed] Finished successfully');
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[Seed] Error during seeding:', err);
      await disconnectDB();
      process.exit(1);
    });
}
