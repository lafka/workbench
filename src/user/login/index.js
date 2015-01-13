require('insert-css')(require('./style.css'))

var client = require('tinymesh-cloud-client/tinymesh-cloud-client');

Vue.component('wb-user-login', {
	template: require('./template.html'),
	replace: true,
	created: function () {
		console.log('created view: user/login', this);
	},
	data: function () {
		return {
			email: "",
			password: "",
			errors: {},
			loginPromise: undefined
		}
	},
	methods: {
		login: function(email, password, e) {
			delete this.errors.credential;
			e.preventDefault();

			if (!email)
				this.$set('errors.email', "Missing email");
			else if (!this.emailValid)
				this.$set('errors.email', "Did you miss-spell? This seems like a invalid email");
			else
				delete this.errors.email;

			if (!password)
				this.$set('errors.password', "You need to provide your password")
			else
				delete this.errors.password;

			if (Object.keys(this.errors).length > 0 ) {
				return;
			}

			var v = this;
			this.$root.$.auth.data = client.auth.login({}, {email: email, password: password});
			this.loginPromise = this.$root.$.auth.data.$promise;

			this.loginPromise
				.then(function(body) {
					v.$root.$.auth.onAuth(body);
					v.$root.$.data.user = client.user.get({auth: body});
				},
				function(err) {
					// @todo add notify shit
					if (err.statusType && err.status === 401) {
						this.$root.$.notify.set('It seems your details are incorrect, give it another go!');
						this.$set('errors.credential', true);
					} else {
						this.$set('errors.credential', false);
						this.$root.$.notify.set(
							'Ops, something went wrong. We are trying to figure it out, please try again later',
							'danger');
					}
				}.bind(this))
				.done(function() {
					this.loginPromise = undefined;
				}.bind(this));
		}
	},
	computed: {
		emailValid: function() {
			return null !== this.email.match(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/)
		}
	}
});
