<template>
  <div>
    <HeaderContainer />
    <main class="mw8 center ph3">
      <article class="lh-copy measure-wide center">
        <template v-for="section in articleData.sections">
          <div :key="section.text">
            <div v-if="section.type === 'text'">
              <h3 v-if="section.title !== 'null'" class="roboto-mono green b">
                {{ section.title }}
              </h3>
              <div v-html="section.text"></div>
            </div>
            <div v-else>
              <component :is="featuredComponent(section.title)" section.type />
            </div>
          </div>
        </template>
        <div class="flex">
          <div class="pa4">
            <img
              :src="articleData.interview.bookpicture"
              loading="lazy"
              class="db lazy-load img-l"
            />
          </div>
          <div class="pa4">
            <img
              :src="articleData.interview.biopicture"
              loading="lazy"
              class="db lazy-load img-r"
            />
          </div>
        </div>
        <template v-for="i in articleData.interview.questions">
          <details :key="i.question" class="question">
            <summary class="pa2 bg-green  ba b--green bw2">
              <h3 class="di lh-title fa5 fa4-ns">{{ i.question }}</h3></summary
            >
            <div class=" ba b--green bw2" v-html="i.response"></div>
          </details>
        </template>
      </article>

      <ShareContainer
        :title="postData.title"
        :description="postData.summary"
        class="mv3"
      />
    </main>
    <FooterContainer />
  </div>
</template>

<script>
import POSTCONFIG from '../post.config'
import CommonUtils from '../mixins/CommonUtils'
import ArticleData from '../data/data.json'
import HeaderContainer from '~/components/Header/HeaderContainer'
import ShareContainer from '~/components/Custom/ShareContainer'
import FooterContainer from '~/components/Footer/FooterContainer'
import FaceApp from '~/components_local/FaceApp'
import Infographic from '~/components_local/Infographic'

export default {
  components: {
    HeaderContainer,
    ShareContainer,
    FooterContainer,
    FaceApp,
    Infographic
  },
  mixins: [CommonUtils],
  asyncData(ctx) {
    return {
      articleData: ArticleData.content[0],
      postData: POSTCONFIG
    }
  },
  data() {
    return {}
  },
  methods: {
    featuredComponent(title) {
      if (title === 'Interactive') {
        return 'FaceApp'
      } else if (title === 'infographic') {
        return 'Infographic'
      }
      return null
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/assets/css/variables';

.img-l {
  box-shadow: -1rem 1rem $green;
}
.img-r {
  box-shadow: 1rem 1rem $green;
}
summary {
  cursor: pointer;
  &:focus {
    outline: 1px dashed rgba($gray, 0.5);
  }
}
</style>
