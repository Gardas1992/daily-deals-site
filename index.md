---
layout: default
title: Latest Deals
---

# Latest Deals

Below are the most recent deal posts:

{% for post in site.posts limit:10 %}
- [{{ post.title }}]({{ post.url }})
{% endfor %}
