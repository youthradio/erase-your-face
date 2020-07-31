<template>
  <div>
    <HeaderContainer />
    <main class="mw8 center">
      <article class="lh-copy">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Mus mauris
          vitae ultricies leo integer. Odio ut sem nulla pharetra. Mauris augue
          neque gravida in fermentum et. Placerat duis ultricies lacus sed.
          Proin fermentum leo vel orci porta non pulvinar neque laoreet.
          Maecenas ultricies mi eget mauris. Malesuada fames ac turpis egestas
          integer eget aliquet nibh. Urna et pharetra pharetra massa massa
          ultricies. Interdum velit laoreet id donec.
        </p>
        <p>
          Vitae purus faucibus ornare suspendisse sed nisi. Dignissim cras
          tincidunt lobortis feugiat vivamus at. Lorem mollis aliquam ut
          porttitor. Mauris in aliquam sem fringilla ut morbi tincidunt augue.
          Lorem ipsum dolor sit amet. Nibh mauris cursus mattis molestie a
          iaculis at. Vulputate sapien nec sagittis aliquam malesuada bibendum.
          Viverra suspendisse potenti nullam ac tortor vitae purus faucibus.
          Interdum consectetur libero id faucibus nisl tincidunt eget. Vulputate
          enim nulla aliquet porttitor lacus luctus. Ornare arcu dui vivamus
          arcu felis bibendum ut tristique. Dignissim cras tincidunt lobortis
          feugiat vivamus at. Turpis massa tincidunt dui ut ornare lectus.
        </p>
        <p>
          Lobortis elementum nibh tellus molestie nunc non blandit massa. Elit
          duis tristique sollicitudin nibh sit amet commodo nulla facilisi.
          Semper eget duis at tellus at urna. Sed faucibus turpis in eu. Sit
          amet volutpat consequat mauris nunc. Libero volutpat sed cras ornare
          arcu dui. Ut pharetra sit amet aliquam id. Turpis egestas pretium
          aenean pharetra magna ac placerat vestibulum. Mi proin sed libero enim
          sed faucibus turpis in eu. Dui accumsan sit amet nulla facilisi morbi
          tempus. Leo a diam sollicitudin tempor. Nunc mi ipsum faucibus vitae
          aliquet nec ullamcorper sit amet. Consectetur libero id faucibus nisl
          tincidunt. In ornare quam viverra orci sagittis. Morbi tincidunt augue
          interdum velit euismod in pellentesque massa. Dolor sit amet
          consectetur adipiscing. Quisque id diam vel quam elementum pulvinar
          etiam non quam. Pellentesque elit eget gravida cum sociis natoque
          penatibus. Urna neque viverra justo nec ultrices dui sapien. Sed id
          semper risus in hendrerit gravida rutrum.
        </p>
        <MapContainer />
        <p>
          Arcu odio ut sem nulla pharetra diam sit amet. Non sodales neque
          sodales ut etiam sit amet nisl purus. Elementum nibh tellus molestie
          nunc non blandit massa enim. Non diam phasellus vestibulum lorem sed
          risus ultricies. Vel facilisis volutpat est velit egestas dui. Ut
          ornare lectus sit amet est placerat in egestas. Scelerisque viverra
          mauris in aliquam. Tortor posuere ac ut consequat semper viverra nam
          libero justo. Libero nunc consequat interdum varius sit. Scelerisque
          felis imperdiet proin fermentum leo vel orci porta. Ut eu sem integer
          vitae justo eget magna fermentum iaculis. Vitae sapien pellentesque
          habitant morbi tristique senectus. Elementum tempus egestas sed sed
          risus. Et sollicitudin ac orci phasellus egestas.
        </p>
        <p>
          In vitae turpis massa sed elementum tempus egestas. Eget mi proin sed
          libero enim sed faucibus. Nullam non nisi est sit amet facilisis magna
          etiam tempor. Arcu non sodales neque sodales ut etiam. Magna sit amet
          purus gravida quis blandit turpis. Ultricies mi quis hendrerit dolor
          magna eget est lorem. Euismod elementum nisi quis eleifend quam
          adipiscing vitae. Urna porttitor rhoncus dolor purus. Nec ullamcorper
          sit amet risus nullam eget. Mi tempus imperdiet nulla malesuada
          pellentesque elit. Vulputate mi sit amet mauris commodo quis imperdiet
          massa. Integer feugiat scelerisque varius morbi enim.
        </p>
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
import MapContainer from '~/components/Map/MapContainer'
import HeaderContainer from '~/components/Header/HeaderContainer'
import ShareContainer from '~/components/Custom/ShareContainer'
import FooterContainer from '~/components/Footer/FooterContainer'

export default {
  components: {
    MapContainer,
    HeaderContainer,
    ShareContainer,
    FooterContainer
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
  computed: {},
  watch: {},
  mounted() {},
  methods: {}
}
</script>

<style lang="scss" scoped></style>
