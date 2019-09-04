<template>
  <section class="app-main">
    <transition name="fade-transform" mode="out-in">
      <keep-alive :include="cachedViews">
        <router-view :key="key" />
      </keep-alive>
    </transition>
    <div class="footer">Copyright © 2012-2017 izhonghong.com All rights Reserved 电话：0755--86102030 传真：0755-862542</div>
  </section>
</template>

<script>
export default {
  name: 'AppMain',
  computed: {
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    },
    key() {
      return this.$route.path
    }
  }
}
</script>

<style lang="scss" scoped>
.app-main {
  /* 50= navbar  50  */
  min-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  overflow: hidden;
}

.fixed-header+.app-main {
  padding-top: 50px;
}

.hasTagsView {
  .app-main {
    /* 84 = navbar + tags-view = 50 + 34 */
    min-height: calc(100vh - 84px);
  }

  .fixed-header+.app-main {
    padding-top: 84px;
  }
}

.footer{
  background: none repeat scroll 0 0 #fff;
  border-top: 1px solid #e7eaec;
  overflow: hidden;
  padding: 10px 6px 0;
  height: 33px;
  font-size: .7rem!important;
  color: #7a8b9a;
  letter-spacing: .8px;
  font-family: Arial,sans-serif!important;
  z-index: 99;
  position: fixed;
  bottom: 0;
  width: 100%;
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
