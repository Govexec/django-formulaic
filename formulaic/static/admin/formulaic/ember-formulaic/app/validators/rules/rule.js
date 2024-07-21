import EmberObject, { computed } from '@ember/object';

export default class RuleValidator extends EmberObject {
  @computed('areConditionsEmpty', 'areResultsEmpty')
  get isInvalid() {
    return this.areConditionsEmpty || this.areResultsEmpty;
  }

  @computed('rule.conditions')
  get areConditionsEmpty() {
    return this.rule.conditions?.length < 1;
  }

  @computed('rule.results')
  get areResultsEmpty() {
    return this.rule.results?.length < 1;
  }

  @computed('isInvalid', 'areConditionsInvalid', 'areResultsInvalid')
  get isInvalidWithChildren() {
    return this.isInvalid || this.areConditionsInvalid || this.areResultsInvalid;
  }

  @computed('conditionValidators.@each.isInvalid')
  get areConditionsInvalid() {
    return this.conditionValidators.some((validator) => validator.isInvalid);
  }

  @computed('resultValidators.@each.isInvalid')
  get areResultsInvalid() {
    return this.resultValidators.some((validator) => validator.isInvalid);
  }

  @computed('rule.conditions.@each')
  get conditionValidators() {

    return this.rule.conditions?.map((condition) => condition.validator) || [];
  }

  @computed('rule.results.@each')
  get resultValidators() {
    return this.rule.results?.map((result) => result.validator) || [];
  }
}
