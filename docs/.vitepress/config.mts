import path from 'path'
import { writeFileSync } from 'fs'
import { Feed } from 'feed'
import { defineConfig, createContentLoader, type SiteConfig } from 'vitepress'
import { withMermaid } from "vitepress-plugin-mermaid";

const hostname: string = 'https://blog.breakme.ca'

// https://vitepress.dev/reference/site-config
export default withMermaid({
  title: "KBaaS",
  description: "Knowledge Base as a Service",
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', {rel: 'alternate', type: 'application/rss+xml', title: 'RSS', href: '/feed.rss'}],
  ],


  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'System Administration',
        items: [
            { text: 'SSH point-to-point tunnel', link: '/kbaas/0'},
            { text: 'Incus DNS resolution with systemd-networkd', link: '/kbaas/1'},
            { text: 'Samba share with sane defaults', link: '/kbaas/2'},
            { text: 'Dummy interface to share resources', link: '/kbaas/3'},
            { text: 'Running Jenkins agent as a service on Windows', link: '/kbaas/4'},
            { text: 'Download offline .Net Framework target pack', link: '/kbaas/5'},
            { text: 'Dynamic Docker containers for CTF', link: '/kbaas/7'},
            { text: 'VPS for egress port testing', link: '/kbaas/9'},
            { text: 'Manage Workgroup hosts with Server Manager', link: '/kbaas/12'},
        ]
      },
      { text: 'Penetration Testing',
        items: [
            { text: 'Reporting boilerplates', link: '/kbaas/6'},
            { text: 'TL;DR Tooling', link: '/kbaas/8'},
            { text: 'Sliver C2', link: '/kbaas/10'},
            { text: 'Cypher queries', link: '/kbaas/cypherqueries'},
            { text: 'Phishing Campaign with GoPhish', link: '/kbaas/11'},
            { text: 'Over Pass the Hash (OPtH)', link: '/kbaas/13'},
            { text: '[WIP] Dnsmasq for penetration testing', link: '/kbaas/14'},
        ]
      },
      { text: 'CLI-fu',
        items: [
            { text: 'One-liners', link: '/kbaas/oneliners'},
        ]
      },
      { text: 'Training',
        items: [
            { text: 'Web Security Academy', link: '/kbaas/websecurityacademy'},
        ]
      },
      { text: 'Bookmarks', link: '/kbaas/bookmarks'},
    ],
    search: {
        provider: 'local'
    },
    lastUpdated: {
        text: 'Updated at',
        formatOptions: {
            dateStyle: 'full',
            timeStyle: 'medium'
        }
    },
    sidebar: [
      { text: 'System Administration',
      items: [
          { text: 'SSH point-to-point tunnel', link: '/kbaas/0'},
          { text: 'Incus DNS resolution with systemd-networkd', link: '/kbaas/1'},
          { text: 'Samba share with sane defaults', link: '/kbaas/2'},
          { text: 'Dummy interface to share resources', link: '/kbaas/3'},
          { text: 'Running Jenkins agent as a service on Windows', link: '/kbaas/4'},
          { text: 'Download offline .Net Framework target pack', link: '/kbaas/5'},
          { text: 'Dynamic Docker containers for CTF', link: '/kbaas/7'},
          { text: 'VPS for egress port testing', link: '/kbaas/9'},
      ]
    },
    { text: 'Penetration Testing',
      items: [
          { text: 'Reporting boilerplates', link: '/kbaas/6'},
          { text: 'TL;DR Tooling', link: '/kbaas/8'},
          { text: 'Sliver C2', link: '/kbaas/10'},
          { text: 'Cypher queries', link: '/kbaas/cypherqueries'},
          { text: 'Phishing Campaign with GoPhish', link: '/kbaas/11'},
          { text: 'Over Pass the Hash (OPtH)', link: '/kbaas/13'},
      ]
    },
    { text: 'CLI-fu',
      items: [
          { text: 'One-liners', link: '/kbaas/oneliners'},
      ]
    },
    { text: 'Training',
      items: [
          { text: 'Web Security Academy', link: '/kbaas/websecurityacademy'},
      ]
    },
    { text: 'Bookmarks', link: '/kbaas/bookmarks'},
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/novakele' },
      { icon: {
        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 380"><defs><style>.cls-1{fill:#e24329;}.cls-2{fill:#fc6d26;}.cls-3{fill:#fca326;}</style></defs><g id="LOGO"><path class="cls-1" d="M282.83,170.73l-.27-.69-26.14-68.22a6.81,6.81,0,0,0-2.69-3.24,7,7,0,0,0-8,.43,7,7,0,0,0-2.32,3.52l-17.65,54H154.29l-17.65-54A6.86,6.86,0,0,0,134.32,99a7,7,0,0,0-8-.43,6.87,6.87,0,0,0-2.69,3.24L97.44,170l-.26.69a48.54,48.54,0,0,0,16.1,56.1l.09.07.24.17,39.82,29.82,19.7,14.91,12,9.06a8.07,8.07,0,0,0,9.76,0l12-9.06,19.7-14.91,40.06-30,.1-.08A48.56,48.56,0,0,0,282.83,170.73Z"/><path class="cls-2" d="M282.83,170.73l-.27-.69a88.3,88.3,0,0,0-35.15,15.8L190,229.25c19.55,14.79,36.57,27.64,36.57,27.64l40.06-30,.1-.08A48.56,48.56,0,0,0,282.83,170.73Z"/><path class="cls-3" d="M153.43,256.89l19.7,14.91,12,9.06a8.07,8.07,0,0,0,9.76,0l12-9.06,19.7-14.91S209.55,244,190,229.25C170.45,244,153.43,256.89,153.43,256.89Z"/><path class="cls-2" d="M132.58,185.84A88.19,88.19,0,0,0,97.44,170l-.26.69a48.54,48.54,0,0,0,16.1,56.1l.09.07.24.17,39.82,29.82s17-12.85,36.57-27.64Z"/></g></svg>'
      }, link: 'https://gitlab.com/novakele' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/christophe-langlois-0b7ba8197/' },
      { icon: {
        svg: '<svg xmlns="http://www.w3.org/2000/svg"id="RSSicon"viewBox="0 0 8 8" width="256" height="256"><style type="text/css">.button {stroke: none; fill: orange;}.symbol {stroke: none; fill: white;}</style><rect   class="button" width="8" height="8" rx="1.5" /><circle class="symbol" cx="2" cy="6" r="1" /><path   class="symbol" d="m 1,4 a 3,3 0 0 1 3,3 h 1 a 4,4 0 0 0 -4,-4 z" /><path   class="symbol" d="m 1,2 a 5,5 0 0 1 5,5 h 1 a 6,6 0 0 0 -6,-6 z" /></svg>',
      }, link: 'https://blog.breakme.ca/feed.rss' },
    ],
    outline: [2,3],
  },
  buildEnd: async (config: SiteConfig) => {
    const feed = new Feed({
      title: 'KBaaS',
      description: 'Knowledge Base as a Service',
      id: hostname,
      link: hostname,
      language: 'en',
      favicon: `${hostname}/favicon.ico`,
      copyright:
        'Copyright (c) 2022-present, Christophe Langlois'
    })

    // You might need to adjust this if your Markdown files 
    // are located in a subfolder
    const posts = await createContentLoader('kbaas/*.md', {
      excerpt: true,
      render: true
    }).load()
  
    posts.sort(
      (a, b) =>
        +new Date(b.frontmatter.date as string) -
        +new Date(a.frontmatter.date as string)
    )
  
    for (const { url, excerpt, frontmatter, html } of posts) {
      feed.addItem({
        title: frontmatter.title,
        id: `${hostname}${url}`,
        link: `${hostname}${url}`,
        description: frontmatter.description,
        content: html,
        author: [
          {
            name: 'Christophe Langlois',
            email: 'rss@correo.breakme.ca',
            link: 'https://blog.breakme.ca'
          }
        ],
        date: frontmatter.date
      })
    }
    writeFileSync(path.join(config.outDir, 'feed.rss'), feed.rss2())
  },
})
