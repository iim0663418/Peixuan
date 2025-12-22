<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-section">
        <h4>{{ $t('common.app_name') }}</h4>
        <p>{{ $t('footer.tagline') }}</p>
      </div>
      <div class="footer-section">
        <h4>{{ $t('footer.services') }}</h4>
        <div class="footer-links">
          <router-link to="/">{{ $t('navigation.home') }}</router-link>
          <router-link to="/unified">{{ $t('astrology.unified') }}</router-link>
          <router-link to="/daily-question">{{ $t('navigation.daily_question') }}</router-link>
          <router-link to="/personality">{{
            $t('navigation.personality')
          }}</router-link>
          <router-link to="/fortune">{{
            $t('navigation.fortune')
          }}</router-link>
        </div>
      </div>
      <div class="footer-section">
        <h4>{{ $t('footer.contact') }}</h4>
        <p>
          {{ $t('footer.copyright', { appName: $t('common.app_name') }) }}
        </p>
        <p>{{ $t('footer.rights') }}</p>
        <p class="footer-github">
          <a
            href="https://github.com/iim0663418/Peixuan"
            target="_blank"
            rel="noopener noreferrer"
            class="github-link"
          >
            <svg
              viewBox="0 0 1024 1024"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              aria-hidden="true"
              focusable="false"
            >
              <path
                fill="currentColor"
                d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9a127.5 127.5 0 0 1 38.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"
              />
            </svg>
            {{ $t('footer.github') }}
          </a>
        </p>
        <p class="footer-licenses">
          Built with
          <a href="https://vuejs.org" target="_blank" rel="noopener noreferrer">
            Vue.js
          </a>
          (MIT),
          <a
            href="https://element-plus.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Element Plus
          </a>
          (MIT),
          <a
            href="https://workers.cloudflare.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cloudflare Workers
          </a>
          (Apache-2.0),
          <a
            href="https://github.com/6tail/lunar-typescript"
            target="_blank"
            rel="noopener noreferrer"
          >
            lunar-typescript
          </a>
          (MIT)
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  /* Added fallbacks for brand colors to ensure visibility in light mode */
  background: linear-gradient(135deg, var(--brand-brown, #8b4513) 0%, var(--brand-brown-light, #a0522d) 100%);
  color: white;
  /* Added fallbacks for spacing variables */
  padding: var(--spacing-xl, 32px) var(--spacing-lg, 24px) var(--spacing-lg, 24px);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg, 24px);
}

.footer-section h4 {
  color: var(--footer-text-gold, #f0e68c);
  margin: 0 0 var(--spacing-md, 16px) 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.footer-section p {
  margin: calc(var(--spacing-sm, 8px) * 1) 0;
  color: var(--footer-text-cream, #e6ddd4);
  line-height: 1.6;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-sm, 8px) * 1);
}

.footer-links a {
  color: var(--footer-text-cream, #e6ddd4);
  text-decoration: none;
  transition: var(--transition-base, all 0.3s ease);
}

.footer-links a:hover {
  color: var(--footer-text-gold, #f0e68c);
}

.footer-licenses {
  font-size: 12px;
  color: rgba(230, 221, 212, 0.7);
  margin-top: var(--spacing-sm, 8px);
}

.footer-licenses a {
  color: var(--footer-text-cream, #e6ddd4);
  text-decoration: none;
  transition: var(--transition-base, all 0.3s ease);
}

.footer-licenses a:hover {
  color: var(--footer-text-gold, #f0e68c);
}

.footer-github {
  margin: var(--spacing-md, 16px) 0 calc(var(--spacing-sm, 8px) * 1) 0;
}

.github-link {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing-sm, 8px) * 1);
  color: var(--footer-text-cream, #e6ddd4);
  text-decoration: none;
  transition: var(--transition-base, all 0.3s ease);
  font-size: 14px;
  padding: calc(var(--spacing-sm, 8px) * 1) 0;
}

.github-link svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.github-link:hover {
  color: var(--footer-text-gold, #f0e68c);
  transform: translateX(3px);
}

/* 手機版 Footer 簡化 (<768px) */
@media (max-width: 767px) {
  .app-footer {
    padding: clamp(1.5rem, 3vw, 2rem) clamp(1rem, 2vw, 1.5rem);
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg, 24px);
    text-align: center;
  }
}

/* 平板 (768px+) */
@media (min-width: 768px) {
  .app-footer {
    padding: var(--spacing-xl, 32px) var(--spacing-lg, 24px) var(--spacing-lg, 24px);
  }

  .footer-content {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-lg, 24px);
    text-align: left;
  }
}

/* 小螢幕手機特定樣式 */
@media (max-width: 479px) {
  .app-footer {
    padding: clamp(1.5rem, 3vw, 2rem) clamp(1rem, 2vw, 1.5rem);
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg, 24px);
    text-align: center;
  }
}

/* 無障礙: 減少動畫 */
@media (prefers-reduced-motion: reduce) {
  .app-footer * {
    animation: none !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
