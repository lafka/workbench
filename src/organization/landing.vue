<style lang="css">
.organization #landing-icon {
	font-size: 15em;
	color: #eaeaea;
	margin-top: 20px;
}
.organization #landing-title {
	color: #777;
}

.organization .landing .content > * { padding-bottom: 15px; }
.organization .landing { padding-top: 65px; }
</style>

<template lang="html">
<div class="row landing">
	<div class="container-fluid" v-if="$root.$.data.user.organizations === []">
			<div class="col-xs-2 text">
				<span id="landing-icon" class="glyphicon glyphicon-file"></span>
			</div>
			<div class="col-xs-offset-1 col-xs-6 content">
				<h2 id="landing-title">You don't have any organizations</h2>
				<p class="lead">
					Organizations helps you manage your networks in a more
					intuitive way when several people needs shared access.
				</p>
				<p>
					If your co-workers have already created a network you can
					ask them to add you to it, otherwise contact us to help you
					setup a new organization.
				</p>

			</div>
	</div>
	<div class="container-fluid" v-if="$root.$.data.user.organizations !== []">
			<div class="col-xs-2 text">
				<span id="landing-icon" class="glyphicon glyphicon-file"></span>
			</div>
			<div class="col-xs-offset-1 col-xs-6 content">
				<h2 id="landing-title">Edit your organizations</h2>
				<p class="lead">
					Organizations helps you manage your networks in a more
					intuitive way when several people needs shared access.
				</p>
				<p>
					Select a organization from the menu on the left side; happy editing:)
				</p>

			</div>
	</div>
</div>
</template>
