# Slate Dashboard

## Comments

- I know there are lots of other dashboards like this, open-source, self-hosted.
- For some reason, none of them actually did ALL the stuff I want.
- So, yes, I made another. You can use or ignore as you'd like.

## Things I'm going for

- Mix of links/launchers, services, and data
- Includes (and will include) content from services (e.g. tasks, notes, appts) into the dashboard
- Suitable for a "office dashboard tv" (someday)

## Architecture
- **Frontend**: Vite-powered vanilla JavaScript SPA
- **Config**: YAML-based configuration with hot reload
- **Layout**: CSS Grid system (12-column responsive design)
- **Widgets**: Modular ES6 modules with async loading
- **Services**: Express.js API proxy for external service integration
- **Themes**: CSS custom properties with real-time switching

## Features
- Easy widget creation
- Easy theme creation
- Self-hostable
- Compatible with Docker
- Store secrets in .env


## Position System
- **New syntax**: `row: 1, column: 10, span: 3` (intuitive)
- **Legacy syntax**: `row: "1", column: "10 / 13"` (CSS Grid lines)
- **Grid**: 12-column system with configurable gaps

## Widgets Available
- **Group**: Collapsible containers with custom backgrounds
- **Preview**: Recent items from external services (Linkwarden, Trilium, Obsidian)
- **Weather**: OpenWeatherMap integration with current conditions
- **Radar**: Weather radar overlay
- **Clock**: Digital clock with date/time formatting
- **MOTD**: Message of the day with dismissible alerts
- **Link**: Smart links with optional status monitoring
- **Todoist**: Task integration with project/tag filtering
- **Theme Switcher**: Real-time theme switching with persistence
- **Image**: Logo/image display with custom styling
- **Status Summary**: Aggregate status monitoring

## Service Integrations
- **Linkwarden**: Recent bookmarks via API
- **Trilium**: Recent notes via ETAPI
- **Obsidian**: Notes via Local REST API
- **Todoist**: Tasks via REST API
- **OpenWeatherMap**: Weather data
- **Status monitoring**: HTTP health checks

## TODO - Next Widgets
- Email (with tagging)
- Calendar (with tagging)
- **PiHole**: Network stats and blocking metrics
- **Linkding**: Minimal bookmark manager integration
- **Wallabag**: Read-later articles
- **Linkace**: Advanced bookmark management
- **Raindrop**: Cloud bookmark service
- **Instapaper**: Article reading service
- **Tailscale**: Network device status
- **Docker**: Container status monitoring
- **System stats**: CPU, memory, disk usage

## Future Enhancements
- **Styling**: Custom padding, margins, borders for widgets
- **Layout**: Variable column counts (not just 12)
- **Sizing**: Height options for widgets
- **Templates**: HTML layout templates with placeholders
- **Animations**: Smooth transitions and loading states
- **Mobile**: Responsive breakpoints and mobile-first design
- **Accessibility**: ARIA labels, keyboard navigation
- **Performance**: Widget lazy loading, caching improvements

