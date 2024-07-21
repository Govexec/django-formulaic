import JSONSerializer from '@ember-data/serializer/json';

export default class RuleSerializer extends JSONSerializer {
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    let data, included;

    if (Array.isArray(payload)) {
      data = payload.map((item) => this._normalizeItem(item));
      included = this._extractIncluded(payload);
    } else {
      data = this._normalizeItem(payload);
      included = this._extractIncluded([payload]);
    }

    included.forEach(record => {
      store.push({data: record});
    });

    return {data};
  }

  _normalizeItem(item) {
    let attributes = {
      operator: item.operator,
      position: item.position
    };

    let relationships = {
      form: item.form ? {data: {type: 'form', id: String(item.form)}} : null,
      conditions: item.conditions ? {
        data: item.conditions.map(condition => ({
          type: 'rulecondition',
          id: String(condition.id)
        }))
      } : [],
      results: item.results ? {data: item.results.map(result => ({type: 'ruleresult', id: String(result.id)}))} : []
    };

    return {id: String(item.id), type: 'rule', attributes, relationships};
  }

  _extractIncluded(payload) {
    let included = [];

    payload.forEach((item) => {
      if (item.conditions && Array.isArray(item.conditions)) {
        item.conditions.forEach(condition => {
          included.push(this._createConditionRecord(condition, item.id));
        });
      }

      if (item.results && Array.isArray(item.results)) {
        item.results.forEach(result => {
          included.push(this._createResultRecord(result, item.id));
        });
      }
    });

    return included;
  }

  _createConditionRecord(condition, ruleId) {
    let attributes = {
      position: condition.position,
      operator: condition.operator,
      value: condition.value
    };

    let relationships = {
      rule: {data: {type: 'rule', id: String(ruleId)}},
      field: condition.field ? {data: {type: 'field', id: String(condition.field)}} : null
    };

    return {
      id: String(condition.id),
      type: 'rulecondition',
      attributes,
      relationships
    };
  }

  _createResultRecord(result, ruleId) {
    let attributes = {
      action: result.action
    };

    let relationships = {
      rule: {data: {type: 'rule', id: String(ruleId)}},
      field: result.field ? {data: {type: 'field', id: String(result.field)}} : null,
      option_group: result.option_group ? {data: {type: 'optiongroup', id: String(result.option_group)}} : null
    };

    return {
      id: String(result.id),
      type: 'ruleresult',
      attributes,
      relationships
    };
  }

  serialize(snapshot, options) {
    let json = super.serialize(...arguments);

    json.conditions = json.conditions || [];
    json.results = json.results || [];

    json.conditions = snapshot.record.conditionsArray.map(condition => this._serializeCondition(condition));
    json.results = snapshot.record.resultsArray.map(result => this._serializeResult(result));

    return json;
  }

  _serializeCondition(condition) {
    let serializedCondition = {
      position: condition.position,
      operator: condition.operator,
      value: condition.value ? condition.value : null,
      field: condition.field ? String(condition.field.id) : null
    };
    if (condition.id) {
      serializedCondition.id = String(condition.id);
    }
    return serializedCondition;
  }

  _serializeResult(result) {
    let serializedResult = {
      action: result.action,
      field: result.field ? String(result.field.id) : null,
      option_group: result.option_group ? String(result.option_group.id) : null
    };
    if (result.id) {
      serializedResult.id = String(result.id);
    }
    return serializedResult;
  }
}
