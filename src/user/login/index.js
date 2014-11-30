require('insert-css')(require('./style.css'))

var client = require('tinymesh-cloud-client/tinymesh-cloud-client');

module.exports = {
  template: require('./template.html'),
  replace: true,
  data: function () {
    return {
			email: "",
			password: "",
			errors: {},
			errFlash: ""
   	}
	},
	methods: {
		login: function(e) {
			e.preventDefault();

			if (!this.email)
				this.$set('errors.email', "Missing email");
			else if (!this.emailValid)
				this.$set('errors.email', "Did you miss-spell? This seems like a invalid email");
			else
				delete this.errors.email;

			if (!this.password)
				this.$set('errors.password', "You need to provide your password")
			else
				delete this.errors.password;

			this.$log();

			if (Object.keys(this.errors).length > 0 ) {
				return;
			}

			var v = this;
			client.auth.login(this.email, this.password)
				.then(function(resp) {
					delete v.$root.errFlash;
					if (200 === resp.status) {
						v.$root.onAuth(resp.body);

						v.$root.flash = undefined;

						console.log('get user', window.location.hash);
						client.user.get({auth: resp.body})
							.then(function(resp) {
								this.$root.router;
								console.log('got user', window.location.hash);
								console.log('router', this.$root.router);
								if ('#/user/logout' === window.location.hash) 
									this.$root.router.setRoute('/');
								else if (window.location.hash)
									this.$root.router.setRoute(window.location.hash.replace(/^#/, ''));
								else
									this.$root.router.setRoute('/');

								console.log('router', this.$root.router);
							});
					} else if (401 === resp.status) {
						v.errFlash = "Invalid credentials";
					}
				});
		}
	},
	computed: {
		emailValid: function() {
			return null !== this.email.match(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/)
		}
	}
}
