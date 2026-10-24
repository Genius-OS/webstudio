# Genius Website Builder

This is the Genius fork of [Webstudio](https://github.com/webstudio-is/webstudio), maintained by Genius Substrates Inc. (Juelzs).

It is a self-hosted visual website builder used as the engine behind the Genius website builder product. It is offered to users over the network, so in accordance with **AGPL-3.0-or-later §13**, the full corresponding source of the modified builder is published in this repository.

## What is in this fork

- `genius/main` starts from the upstream release tag `0.306.0` and carries only **website-editor changes** on top of it:
  - Genius branding on the builder interface.
  - Self-hosting fixes (behind a reverse proxy, custom Postgres, etc.).
  - A generic external-auth strategy (signed JWT / OIDC, configurable by environment) for single sign-on.
- No platform, agent, sign-in handoff, tenant or service-specific logic lives here. Those stay in private repositories.

## License

- This fork, like upstream Webstudio core, is free/open-source under **AGPL-3.0-or-later**. See [LICENSE](./LICENSE).
- **sdk-components-animation** package (optional) is proprietary. You must accept the Webstudio, Inc. EULA located in [sdk-components-animation/LICENSE](./packages/sdk-components-animation/LICENSE) before using it.

## Upstream

All credit for the underlying platform goes to the Webstudio team. Upstream project: https://github.com/webstudio-is/webstudio — see the original README below.

---

<img width="1512" alt="builder-screenshot" src="https://github.com/webstudio-is/.github/blob/main/assets/builder-screenshot.png?raw=true">
<br /><br />

<section align="center">
  Webstudio is an Open Source Visual Development Platform for developers, designers, and cross-functional teams. You own the data, components, and infrastructure. You can use the hosted version or roll out your own.
</section>
<br /><br />

## Learning Resources

- [Blog](https://webstudio.is/blog)
- [Documentation](https://docs.webstudio.is/)
- [Contributing](https://docs.webstudio.is/contributing/contributions)
- [Builder Issues Tracker](https://github.com/webstudio-is/webstudio/issues)
- [Roadmap](https://github.com/orgs/webstudio-is/projects/11)

## Social Media

- [Twitter](https://twitter.com/getwebstudio)
- [Youtube](https://www.youtube.com/@getwebstudio)
- [Discord](https://wstd.us/community)
