import JSONSerializer from '@ember-data/serializer/json';

export default class PrivacyPolicySerializer extends JSONSerializer {
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {

    console.warn('Received payload:', payload);

    let data = payload.map(policy => ({
      id: String(policy.id),
      type: 'privacypolicy',
      attributes: {
        name: policy.name,
        text: policy.text
      }
    }));

    return { data }
  }
}
