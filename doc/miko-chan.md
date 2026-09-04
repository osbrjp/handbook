---
title: "Miko-chan"
section: "In-house"
nav_label: "Projects"
sort: 0
visibility: public
updated_by: "VibratingKoala"
updated_at: "2026-09-04T09:08:31.806Z"
---

# Miko-chan

[[TOC]]

## What is Miko-chan?

Miko-chan is currently an in-house project by OSBR.

Miko-chan is an ecosystem comprised of 3 sub-systems:

- Miko-manager: Slack bot
- Miko-admin: Backend system with MCP support and frontend admin console
- Miko-assistant: Desktop pet

## Origin of name
It's an ecosystem of 3 systems, and 3 can also be read as Mi (み). みこ.
Miko was also the name of a beloved cat of one of our member that acts as a mascot for Miko-manager, our in-house Slack bot.

## Miko-manager

Miko-manage is a Slack bot that first started out as an attendance taking bot, using Google App Script. Currently it has been convert to use Miko-admin backend system to serve. It's also connected to GPT API to be smarter in its responses or to understand prompts better. Currently it still servers as an attendance bot mainly, as well as serving to check on commits history in Github as well as leaves information stored in Miko-admin.

## Miko-admin

Miko-admin is an administration system infrastructure. Currently it acts as a backend with database for both Miko-manager and Miko-assistant. Miko-admin has its MCP server in which Miko-assistant connects to. Miko-manager also uses the Miko-admin backend to serve requests through slack. It currently houses the data for leaves and attendences for OSBR members.

## Miko-assistant

Miko-assistant is a MacOS desktop pet.
It operates by using Claude as the brain at the moment. Whatever ClaudeCode can do, Miko can.
Miko also has a automated development loops built it. Just have to tell Miko to file an issue and start working on it, Miko will create an issue on repo of choice using Github CLI commands and then create a PullRequest and start making changes on it. Miko also comes with Miko-reviewer that reviews the code on PullRequests.
Among the more interesting feature for Miko-assistant is that it has a feature called Tako-control, that is used to spawn and control 8 development terminals simultaneously. Example: you ask Miko to work on 8 different repos, and Miko will drive the terminals and manage the terminals for you, you just have to go through Miko.
Another feature that makes it easier for development is RemoteAccess. You can control Miko using your phone either from your mobile browsers or using it as a PWA. It currently connects through 2 channels, a worker relay easier to setup, or Tailscale if you're privacy or security conscious or performance is essential.

## How to install
Release page: https://miko-site.osbrjp.workers.dev/
