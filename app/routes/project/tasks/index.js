import Ember from 'ember';

const {
  get,
  inject: { service },
  Route,
  RSVP
} = Ember;

export default Route.extend({
  projectTaskBoard: service(),

  async model() {
    let project = this.modelFor('project');
    let projectUsers = await get(project, 'projectUsers');
    let memberPromises = projectUsers.mapBy('user');
    let taskLists = get(project, 'taskLists');
    taskLists.forEach((taskList) => get(taskList, 'tasks').reload());
    return RSVP.hash({ project, members: RSVP.all(memberPromises) });
  },

  setupController(controller, models) {
    controller.setProperties(models);
  },

  actions: {
    didTransition() {
      this._super(...arguments);
      get(this, 'projectTaskBoard').activate();
      return true;
    },

    willTransition() {
      this._super(...arguments);
      get(this, 'projectTaskBoard').deactivate();
      return true;
    },

    transitionToTask(task) {
      let project = get(task, 'project');
      let organizationSlug = get(project, 'organization.slug');
      let projectSlug = get(project, 'slug');
      let taskNumber = get(task, 'number');
      this.transitionTo('project.tasks.task', organizationSlug, projectSlug, taskNumber);
    }
  }
});
