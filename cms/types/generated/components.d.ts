import type { Schema, Struct } from '@strapi/strapi';

export interface HomeAudience extends Struct.ComponentSchema {
  collectionName: 'components_home_audiences';
  info: {
    description: 'Who it is for heading, button label and its four fixed groups.';
    displayName: 'Audience';
  };
  attributes: {
    cta: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 19;
        minLength: 1;
      }>;
    groups: Schema.Attribute.Component<'home.audience-group', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 4;
          min: 4;
        },
        number
      >;
    intro: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
        minLength: 1;
      }>;
  };
}

export interface HomeAudienceGroup extends Struct.ComponentSchema {
  collectionName: 'components_home_audience_groups';
  info: {
    description: 'One Who it is for tab. Points must describe Available features only.';
    displayName: 'Audience group';
  };
  attributes: {
    built: Schema.Attribute.Component<'home.audience-point', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 6;
          min: 3;
        },
        number
      >;
    description: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 130;
        minLength: 1;
      }>;
    tagline: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 40;
      }>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 40;
        minLength: 1;
      }>;
    points: Schema.Attribute.Component<'home.audience-point', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 3;
        },
        number
      >;
  };
}

export interface HomeAudiencePoint extends Struct.ComponentSchema {
  collectionName: 'components_home_audience_points';
  info: {
    description: 'One short line: a sub-audience or a check-marked point.';
    displayName: 'Audience point';
  };
  attributes: {
    text: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 95;
        minLength: 1;
      }>;
  };
}

export interface HomeClose extends Struct.ComponentSchema {
  collectionName: 'components_home_closes';
  info: {
    description: 'Closing band heading, line and form button label.';
    displayName: 'Close band';
  };
  attributes: {
    cta: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 19;
        minLength: 1;
      }>;
    line: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 77;
        minLength: 1;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 46;
        minLength: 1;
      }>;
  };
}

export interface HomeDecide extends Struct.ComponentSchema {
  collectionName: 'components_home_decides';
  info: {
    description: 'Decide heading and sub. The board, evidence and status strings stay in code.';
    displayName: 'Decide';
  };
  attributes: {
    sub: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 63;
        minLength: 1;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
        minLength: 1;
      }>;
  };
}

export interface HomeFaq extends Struct.ComponentSchema {
  collectionName: 'components_home_faqs';
  info: {
    description: 'FAQ heading and items (3 to 10).';
    displayName: 'FAQ';
  };
  attributes: {
    items: Schema.Attribute.Component<'home.faq-item', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 10;
          min: 3;
        },
        number
      >;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 34;
        minLength: 1;
      }>;
  };
}

export interface HomeFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_home_faq_items';
  info: {
    description: 'One FAQ question and answer. Also feeds the FAQPage JSON-LD.';
    displayName: 'FAQ item';
  };
  attributes: {
    answer: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 420;
        minLength: 1;
      }>;
    question: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 62;
        minLength: 1;
      }>;
  };
}

export interface HomeFooter extends Struct.ComponentSchema {
  collectionName: 'components_home_footers';
  info: {
    description: 'Footer text and the maker link.';
    displayName: 'Footer';
  };
  attributes: {
    copyright: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 17;
        minLength: 1;
      }>;
    address: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
    email: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 80;
      }>;
    phone: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 30;
      }>;
    line: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 95;
        minLength: 1;
      }>;
    maker: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 28;
        minLength: 1;
      }>;
    makerHref: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
        minLength: 1;
      }>;
  };
}

export interface HomeHero extends Struct.ComponentSchema {
  collectionName: 'components_home_heros';
  info: {
    description: 'Hero headline and sub.';
    displayName: 'Hero';
  };
  attributes: {
    sub: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 189;
        minLength: 1;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 39;
        minLength: 1;
      }>;
  };
}

export interface HomeHow extends Struct.ComponentSchema {
  collectionName: 'components_home_hows';
  info: {
    description: 'How it works heading and its nine steps.';
    displayName: 'How';
  };
  attributes: {
    intro: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    steps: Schema.Attribute.Component<'home.step', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 9;
          min: 9;
        },
        number
      >;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 16;
        minLength: 1;
      }>;
  };
}

export interface HomeNav extends Struct.ComponentSchema {
  collectionName: 'components_home_navs';
  info: {
    description: 'Header and footer link labels. The targets (#results etc.) stay in code.';
    displayName: 'Nav';
  };
  attributes: {
    cta: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 19;
        minLength: 1;
      }>;
    faqLabel: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 10;
        minLength: 1;
      }>;
    howLabel: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 16;
        minLength: 1;
      }>;
    interviewLabel: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 12;
        minLength: 1;
      }>;
    resultsLabel: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 10;
        minLength: 1;
      }>;
    screeningLabel: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 12;
        minLength: 1;
      }>;
  };
}

export interface HomePlatform extends Struct.ComponentSchema {
  collectionName: 'components_home_platforms';
  info: {
    description: 'Platform heading and its nine fixed tiles. Each tile is a named field so text cannot be paired with the wrong demo.';
    displayName: 'Platform';
  };
  attributes: {
    analytics: Schema.Attribute.Component<'home.tile', false> &
      Schema.Attribute.Required;
    candidate: Schema.Attribute.Component<'home.tile', false> &
      Schema.Attribute.Required;
    career: Schema.Attribute.Component<'home.tile', false> &
      Schema.Attribute.Required;
    dashboard: Schema.Attribute.Component<'home.tile', false> &
      Schema.Attribute.Required;
    interviews: Schema.Attribute.Component<'home.tile', false> &
      Schema.Attribute.Required;
    jobs: Schema.Attribute.Component<'home.tile', false> &
      Schema.Attribute.Required;
    pipeline: Schema.Attribute.Component<'home.tile', false> &
      Schema.Attribute.Required;
    scheduling: Schema.Attribute.Component<'home.tile', false> &
      Schema.Attribute.Required;
    intro: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 230;
        minLength: 1;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 46;
        minLength: 1;
      }>;
  };
}

export interface HomeResults extends Struct.ComponentSchema {
  collectionName: 'components_home_resultss';
  info: {
    description: 'Results heading and caption. The figures and funnel stay in code.';
    displayName: 'Results';
  };
  attributes: {
    caption: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 77;
        minLength: 1;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 45;
        minLength: 1;
      }>;
  };
}

export interface HomeStep extends Struct.ComponentSchema {
  collectionName: 'components_home_steps';
  info: {
    description: 'One step of How it works.';
    displayName: 'How step';
  };
  attributes: {
    text: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 137;
        minLength: 1;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 45;
        minLength: 1;
      }>;
  };
}

export interface HomeTestimonials extends Struct.ComponentSchema {
  collectionName: 'components_home_testimonials';
  info: {
    description: 'Heading of the candidate testimonials section after Results. The quotes, names, photos and order stay in code. Optional: the code default shows when unset.';
    displayName: 'Testimonials';
  };
  attributes: {
    readMore: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 24;
      }>;
    showLess: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 24;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
        minLength: 1;
      }>;
  };
}

export interface HomeTileextends Struct.ComponentSchema {
  collectionName: 'components_home_tiles';
  info: {
    description: 'Title and line of one platform tile.';
    displayName: 'Platform tile';
  };
  attributes: {
    line: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 93;
        minLength: 1;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 28;
        minLength: 1;
      }>;
  };
}

export interface SeoMeta extends Struct.ComponentSchema {
  collectionName: 'components_seo_metas';
  info: {
    description: 'Per-page SEO fields. focusKeyword and keywords feed the editor SEO panel only and are never rendered as meta tags.';
    displayName: 'SEO meta';
  };
  attributes: {
    breadcrumbLabel: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 40;
      }>;
    canonicalUrl: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 300;
      }>;
    focusKeyword: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    follow: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    index: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    keywords: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 170;
        minLength: 50;
      }>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    ogDescription: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    ogImage: Schema.Attribute.Media<'images'>;
    ogTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 90;
      }>;
    structuredData: Schema.Attribute.JSON;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'home.audience': HomeAudience;
      'home.audience-group': HomeAudienceGroup;
      'home.audience-point': HomeAudiencePoint;
      'home.close': HomeClose;
      'home.decide': HomeDecide;
      'home.faq': HomeFaq;
      'home.faq-item': HomeFaqItem;
      'home.footer': HomeFooter;
      'home.hero': HomeHero;
      'home.how': HomeHow;
      'home.nav': HomeNav;
      'home.platform': HomePlatform;
      'home.results': HomeResults;
      'home.step': HomeStep;
      'home.testimonials': HomeTestimonials;
      'home.tile': HomeTile;
      'seo.meta': SeoMeta;
    }
  }
}
