<template>
  <div>
    <HeaderContainer />
    <main class="mw8 center ph3">
      <article class="lh-copy measure-wide center">
        <template v-for="section in articleData.sections">
          <div :key="section.text">
            <div v-if="section.type === 'text'">
              <h3 class="roboto-mono green b">{{ section.title }}</h3>
              <div v-html="section.text"></div>
            </div>
            <div v-else>
              <component :is="featuredComponent(section.title)" section.type />
            </div>
          </div>
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
<style lang="scss" scoped></style>
