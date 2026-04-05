export const generateOfferHTML = (data) => {
  const format = (n) => Number(n || 0).toLocaleString("en-IN");
  const monthly = (n) => Math.round((n || 0) / 12).toLocaleString("en-IN");

  const A = (data.basic || 0) + (data.hra || 0) + (data.da || 0) + (data.specialAllowance || 0);
  const pf = Math.round((data.basic || 0) * 0.12);
  const B = pf;
  const total = A + B;
  const net = total - (data.tds || 0);

  return `
<html>
<head>
<style>

/* ===== GLOBAL ===== */
body {
  font-family: "Times New Roman", serif;
  font-size: 15px;               /* ✅ as requested */
  line-height: 1.6;
  margin: 0;

  /* 🔥 MAIN FIX */
  padding-top: 130px;            /* more space from logo */
  padding-bottom: 90px;          /* bottom space */
}

/* ===== CONTENT ===== */
.container {
  width: 80%;                    /* balanced width */
  margin: 0 auto;
}

.footer {
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
  color: #555;
}
/* ===== LOGO ===== */
.logo {
  position: fixed;
  top: 25px;
  right: 60px;
  height: 60px;
}

/* ===== HEADER ===== */
.company {
  font-weight: bold;
  font-size: 17px;
}

.address {
  font-size: 13px;
  margin-bottom: 15px;
}

/* ===== TITLE ===== */
.title {
  text-align: center;
  font-weight: bold;
  text-decoration: underline;
  margin: 15px 0;
  font-size: 16px;
}

/* ===== TEXT ===== */
.section { margin-top: 10px; }
.right { text-align: right; }
.bold { font-weight: bold; }

/* ===== TABLE ===== */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 13px;     /* slightly increased */
  table-layout: fixed;
}

td, th {
  border: 1px solid black;
  padding: 7px;         /* 🔥 from 6 → 8 (small improvement) */
  font-size: 13px;      /* 🔥 from 13 → 14 (perfect balance) */
  word-wrap: break-word;
}

th {
  background: #d9e1f2;
  font-size: 13.5px;    /* slightly bigger header */
}

.green {
  background: #d9ead3;
  font-weight: bold;
}

/* ===== PAGE BREAK ===== */
.page-break {
  page-break-before: always;
}

</style>
</head>

<body>

<img src="data:image/png;base64,${data.logoBase64}" class="logo"/>

<div class="container">


<!-- EMPLOYEE -->
<div class="section bold">
${data.employeeName}<br>
${data.relationPrefix && data.fatherName ? `${data.relationPrefix} ${data.fatherName}<br>` : ""}
${(data.employeeAddress || []).join("<br>")}
</div>

<!-- TITLE -->
<div class="title">
Sub: Letter of Offer and Terms of Employment
</div>

<!-- DATE -->
<div class="right bold">
Date: ${new Date(data.joiningDate).toLocaleDateString("en-GB")}
</div>

<!-- BODY -->
<div class="section">
<b>Dear ${data.employeeName},</b>
</div>

<div class="section">
With reference to your interview with us, we are pleased to offer you the position of 
${data.designation ? `“${data.designation}”` : "the offered position"} at our Company, as per the 
terms & conditions discussed with you.
</div>

<div class="section">
We look forward to you joining us at the earliest. We are certain that you will find 
challenge, satisfaction, and opportunity in your association with the Company. If you 
are agreeable to the said terms, you are requested to report for duty on 
<b>${new Date(data.joiningDate).toLocaleDateString("en-GB")}</b>.
</div>

<div class="section bold">
On the aforesaid date of joining, you are required to submit the following documents / particulars:
</div>

<ol>
<li>Relevant copies of Academic / Professional attainments and work experience.</li>
<li>Two passport-sized coloured photographs.</li>
<li>Photocopy of Aadhaar card and PAN card.</li>
<li>A duly signed letter of conduct and employee clearance letter or No Dues Certificate from your current organization (If you are currently associated with
any organisation).</li>
<li>Please submit your Form 16 and investment declaration form to the Finance team on your joining date for the purpose of Income Tax computation (if applicable).</li>
</ol>

<div class="section">
If, upon verification at the time of appointment or at a later date, it is found that the 
information furnished by you is incorrect or misleading, your services with us will be liable to termination.
</div>

<div class="section">
Please sign the duplicate copy of this Letter of Intent as a token of your acceptance of the above terms and return the same to our office at the earliest.
</div>

<div class="page-break"></div>
<br/>
<!-- TERMS -->
<div class="bold">Terms & Conditions of Employment</div>

<div class="section bold">Position & Responsibilities:</div>
<ul>
<li>The employee shall be appointed as ${data.designation ? `“${data.designation}”` : "the offered position"} at Valour Technologies Pvt Ltd.</li>
<li>Responsibilities include, but are not limited to, database installation, configuration, maintenance, performance tuning, security management, backup and recovery, user access control, and ensuring data integrity and availability.</li>
</ul>

<div class="section bold">Compensation & Benefits:</div>
<ul>
<li>The employee will receive a monthly salary as per company norms as mentioned below.</li>
<li>Performance-based bonuses, if applicable, will be decided by management.</li>
<li>Additional benefits such as health insurance, paid leave, and reimbursements will be as per company policy.</li>
</ul>

<div class="section bold">Probation Period:</div>
<ul>
<li>The first 3 months shall be considered a probationary period.</li>
<li>Performance will be reviewed, and upon satisfactory performance, employment will be confirmed.</li>
</ul>

<div class="section bold">Work Hours & Location:</div>
<ul>
<li>The employee shall adhere to Valour Technologies Pvt Limited working hours
(e.g., Mon- Fri, 9 AM - 5 PM GMT).</li>
<li>Work location will be Remote, subject to company policies and project
requirements.</li>
</ul>

<div class="section bold">Confidentiality & Non-Disclosure:</div>
<ul>
<li>The employee agrees to maintain strict confidentiality regarding company data, intellectual property, and client information.</li>
<li>Unauthorized sharing of confidential information may result in termination and legal action.</li>
</ul>

<div class="section bold">Non-Compete & Conflict of Interest:</div>
<ul>
<li>The employee shall not engage in any activity or employment that conflicts with company interests during their tenure.</li>
<li>Post-employment restrictions may apply for a period of 6 months, as per company policy.</li>
</ul>

<div class="page-break"></div>
<br/><br/>

<div class="section bold">Intellectual Property Rights:</div>
<ul>
<li>Any software, code, or solutions developed during employment shall remain the exclusive property of the Company.</li>
</ul>

<div class="section bold">Leave & Attendance:</div>
<ul>
<li>The employee is entitled to 12 days of paid leave per year, subject to approval.</li>
<li>Unapproved or excessive absences may result in disciplinary action.</li>
</ul>

<div class="section bold">Termination & Notice Period:</div>
<ul>
<li>Either party may terminate this contract with 30 days’ written notice.</li>
<li>In case of misconduct or policy violations, immediate termination without notice may be applicable.</li>
</ul>

<div class="section bold">Dispute Resolution:</div>
<ul>
<li>Any disputes shall be subject to the jurisdiction of courts in Hyderabad, Telangana.</li>
</ul>

<!-- CTC -->
<div class="bold">Proposed CTC for the Year</div>

<table>
<tr><td>Name</td><td>${data.employeeName}</td></tr>
<tr><td>Designation</td><td>${data.designation}</td></tr>
<tr><td>Place of Work</td><td>Remote</td></tr>
</table>

<table>
<tr>
<th>Salary Components</th>
<th>INR (pa)</th>
<th>INR (pm)</th>
</tr>

<tr><td>Basic Salary</td><td>${format(data.basic)}</td><td>${monthly(data.basic)}</td></tr>
<tr><td>House Rent Allowance (HRA)</td><td>${format(data.hra)}</td><td>${monthly(data.hra)}</td></tr>
<tr><td>Dearness Allowance (DA)</td><td>${format(data.da)}</td><td>${monthly(data.da)}</td></tr>
<tr><td>Special Allowance</td><td>${format(data.specialAllowance)}</td><td>${monthly(data.specialAllowance)}</td></tr>

<tr><td>Total Guaranteed Salary per annum (A)</td><td>${format(A)}</td><td>${monthly(A)}</td></tr>
<tr><td>PF Employer</td><td>${format(pf)}</td><td>${monthly(pf)}</td></tr>
<tr><td>Total Retirals per annum (B)</td><td>${format(B)}</td><td>${monthly(B)}</td></tr>

<tr class="green">
<td>Total Cost to Company (A+B)</td>
<td>${format(total)}</td>
<td>${monthly(total)}</td>
</tr>
</table>

<div class="page-break"></div>
<br/><br/><br/><br/>
<table>
<tr><td>TDS Deduction (C)</td><td>${format(data.tds)}</td><td>${monthly(data.tds)}</td></tr>
<tr><td>Total Guaranteed Salary (A+B-C)</td><td>${format(net)}</td><td>${monthly(net)}</td></tr>
<tr><td>Net Pay</td><td>${format(net)}</td><td>${monthly(net)}</td></tr>
</table>

<br/><br/>
<!-- FINAL -->
<div class="bold">Acceptance & Acknowledgment:</div>

<div class="section">
By signing this letter, the employee agrees to the terms & conditions mentioned
above and confirms their acceptance of the offer.

<br/><br/>

I, ${data.employeeName}, hereby confirm that I have read and understood my remuneration package mentioned above and accept the same. I declare that there are no other components of my pay structure that have not been detailed above, and that it is accurate and comprehensive.
</div>
<br/><br/>
<div class="right section">
Name of Candidate<br>
<b>${data.employeeName}</b><br>
Signature & Date
</div>

</div>

<div class="footer">
Valour Technologies Pvt Ltd | Confidential
</div>
</body>
</html>
`;
};