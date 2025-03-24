# On-boarding Guide

Welcome to OSBR! This guide outlines the on-boarding process for new team members.

[[TOC]]

## 1. First Day

### 1-1. Company Introduction

On the first day, new team members will receive a formal introduction to OSBR. This process includes:

- **Welcome meeting**: A 30-minute session with the team lead to welcome the new member
- **Vision and strategy presentation**: Overview of OSBR's vision, business models, and strategic direction using the [Strategy Overview](/strategy) document
- **Company history discussion**: Insight into OSBR's journey, from its founding to current initiatives
- **Q&A session**: Opportunity for new members to ask questions about the company

The HR representative will schedule these sessions and provide access to relevant documentation before the meetings. New members should review the [Strategy Overview](/strategy) document in advance to make the sessions more productive.

### 1-2. Account Preparation / Introduction to Internal Tools

On the first day, the IT team will set up necessary accounts for new team members:

| Account Type | Setup Process | Required Information |
|--------------|---------------|----------------------|
| **Google Workspace** | HR sends invitation to company email | Personal email for verification |
| **Slack** | Manual invitation after Google setup | Google account |
| **GitHub** | Manual invitation to organization | GitHub username or email |

After setting up accounts, the IT team will briefly introduce you to our basic tools and how to access them. This short orientation covers just what you need to get started with our daily communication and work systems.

### 1-3. Kitting

#### Device Setup

* Configure sleep mode to activate within 5 minutes, with mandatory reauthentication after sleep
* Install antivirus software on Windows devices
* Prohibit keeping files permanently on the desktop
* Prohibit displaying text in the browser's bookmark bar
* Configure proxy settings for verification and production environment testing

::: warning Notice
Development on self-built development servers is prohibited.
:::

#### GitHub Email Notification Settings

Configure your email notification settings to receive notifications from GitHub. Ensure that you are notified when other developers mention you.

#### Container Runtime Environment Setup

Make sure you can execute the `docker` and `docker compose` commands on your terminal. Containers will be used for development tasks such as compiling, running applications, package management, and executing tests.

::: info NOTE
While Docker Desktop is the standard reference, you can also use other tools like Rancher Desktop.
:::

#### Editor Configuration

Set up your editor to enable features like auto-completion, navigation, and error checking for the languages used in the project (TypeScript, Go). Also, configure it to automatically format code upon file save. Use Prettier for TypeScript and `go fmt` for Go.

#### Language Runtime Environment Setup

While container-based development environments are the default, also set up the runtime environment for the languages on your local machine. For Node.js, use tools like `nodebrew` that allow easy version switching.

::: info NOTE
Some tools, such as AWS CDK, might require credentials to be passed via environment variables or files when run inside containers. Due to security considerations, a non-container-based approach might be preferred in such cases.
:::

#### Enable Screenshots and Screen Recording

Throughout the development process, you may need to record operations as images or videos. Set up your system to be ready for this when needed.

For Mac, it is recommended to use **Skitch** for screenshots and **QuickTime Player** (`shift + command + 5`) for video recording.

#### Subscribe to Japan & Malaysia holiday event calendar

Since OSBR has employees from both Japan and Malaysia, it is important to receive notifications when the current or following day is a public holiday in both countries for other employees to better plan tasks and meetings in advance.

To subscribe to a holiday calendar on macOS, open the Calendar app, go to File > New Calendar Subscription, enter the calendar's web address (like https://www.officeholidays.com/ics/malaysia), and follow the prompts to name the calendar, choose an account, and set update frequency

## 2. First Week

### 2-1. Reading the OSBR Handbook

During your first week, you should thoroughly review the OSBR Handbook to understand our company philosophy, processes, and expectations. Understanding our development flow and the intention behind our workflow is particularly important. While agile methodologies typically prioritize communication over documentation, we place significant value on documentation. To maintain agility, we focus on recording essential information with less effort in the right places, creating a system where this documentation enhances rather than hinders our agile practices. This balance allows us to preserve knowledge effectively while maintaining the flexibility and responsiveness that agile development requires.

### 2-2. Tutorial

During your first week, you'll complete a hands-on tutorial that walks you through our entire development workflow. This tutorial is conducted in a safe environment using the [`osbrjp/tutorial`](https://github.com/osbrjp/tutorial) repository, where you can practice without affecting production systems.

The tutorial covers these key activities:

1. Creating an issue with the appropriate template
2. Starting a pull request with detailed specifications
3. Getting a specification review from a team member
4. Making code changes in a properly named branch
5. Conducting a self-review and attaching evidence (screenshots/videos)
6. Requesting an implementation review
7. Experiencing the release process

This practical exercise will help you internalize our development practices and understand how we track, implement, review, and deploy changes. Your mentor will guide you through this process and answer any questions you have along the way.

### 2-3. Meet the Team

After completing the tutorial, you'll contribute to the [`osbrjp/meet-the-team`](https://github.com/osbrjp/meet-the-team) repository to introduce yourself to your colleagues. This exercise serves two purposes: further practice with our workflow and helping the team get to know you better.

The process involves:

1. Creating an issue titled "Introduce [Your Name]"
2. Working through our standard workflow with a pull request
3. Creating your personal introduction page in the repository
4. Writing a reflective essay on what "Be Nice, Be Kind, Be Strong" means to you

Your introduction should follow the provided template and include information about your role, interests, and background. The "Be Nice, Be Kind, Be Strong" essay is an important part of our team culture, encouraging you to think about these values in your own words.

This assignment helps integrate you into the team's culture while giving you additional practice with our development workflow in a low-pressure context.

### 2-4. First Handbook Assignment

In your first week, you'll make a small but meaningful contribution to the OSBR Handbook itself. While this isn't software code, it's equally important as it's our live documentation that guides the entire team's work.

We believe that everyone, regardless of tenure, should be able to contribute to our documentation. While major changes to handbook rules would not be appropriate for someone who just joined, we don't want to restrict editing only to those with longer tenure. Fresh perspectives often notice inconsistencies, unclear explanations, or opportunities for improvement that those familiar with the content might miss.

For this assignment:

1. Identify a small area of the handbook where you can make an improvement
   - This could be fixing a typo, clarifying wording, adding a missing explanation, or suggesting a small enhancement
   - Your mentor can help you find an appropriate area if needed

2. Use our standard workflow (as practiced in the tutorial) to propose and implement this change
   - Create an issue describing what you'd like to improve and why
   - Get feedback on your approach
   - Make the change through a pull request
   - Attach appropriate evidence for review

This exercise demonstrates our commitment to collective ownership of documentation and gives you the confidence to suggest improvements from day one. Finding ways for new team members to contribute immediately is important to us, even if those contributions start small.

## 3. First Month

### 3-1. Mastering Technical Terminology

During your first month, you'll need to familiarize yourself with the technical terminology commonly used at OSBR. Understanding these terms is crucial for effective communication with team members and clients.

We've created a comprehensive technical glossary that you should review and reference as needed. The glossary includes formal definitions, common usage contexts, and related concepts for each term.

Your mentor will guide you through this learning process and help identify which terms are most relevant to your specific role and projects. As part of this process, you'll be asked to:

1. Review the technical glossary
2. Identify terms you're unfamiliar with
3. Learn and practice using these terms in appropriate contexts
4. Develop insights into how different terms relate to each other and form a cohesive understanding of our technology ecosystem

You can access the full technical glossary [here](/technical-glossary).


### 3-2. Practice Project Using Our Workflow

After the tutorial, you'll work on a practice project alongside your terminology learning (3-1). This small, self-contained project applies our complete workflow in a realistic setting and typically takes **1-2 weeks**. 

For this assignment, you'll create multiple issues and pull requests while receiving guidance from your mentor. You'll experience the entire process from planning to implementation to release, with feedback on both technical implementation and process adherence. The project uses actual production technologies and frameworks relevant to your future work, bridging the gap between tutorials and real projects while providing a safe learning environment.

### 3-3. Research Assignment for Your First Real Project

Before joining your first real project, you'll research the project's domain and technical requirements. This includes reviewing documentation, studying the technology stack, understanding business requirements, and identifying potential contributions. Your mentor will guide this process and connect you with team members. At month's end, you'll present your findings to the project team, marking your transition to active participation.

