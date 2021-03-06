'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('./common').mongoose;

const assert = require('assert');

const Schema = mongoose.Schema;

describe('SingleNestedPath', function() {
  describe('discriminator()', function() {
    describe('recursive nested discriminators', function() {
      it('allow multiple levels of data in the schema', function() {
        const singleEventSchema = new Schema({
          message: String,
        }, { _id: false, discriminatorKey: 'kind' });

        const subEventSchema = new Schema({
          sub_events: [singleEventSchema]
        }, {_id: false});

        subEventSchema.path('sub_events').discriminator('SubEvent', subEventSchema);

        let currentEventLevel = subEventSchema;
        for (let i = 0; i < 5; i++) {
          const subEventSchemaDiscriminators = currentEventLevel.path('sub_events').schema.discriminators;
          assert.ok(subEventSchemaDiscriminators);
          assert.ok(subEventSchemaDiscriminators.SubEvent);
          currentEventLevel = subEventSchemaDiscriminators.SubEvent;
        }
      });

      it('allow multiple levels of data in a document', function() {
        const singleEventSchema = new Schema({
          message: String,
        }, { _id: false, discriminatorKey: 'kind' });

        const subEventSchema = new Schema({
          sub_events: [singleEventSchema]
        }, {_id: false});

        subEventSchema.path('sub_events').discriminator('SubEvent', subEventSchema);

        const SubEvent = mongoose.model('MultiLevelDataDoc', subEventSchema);
        const multiLevel = {
          // To create a recursive document, the schema was modified, so kind & message are added
          kind: 'SubEvent',
          message: 'level 1',
          sub_events: [{
            kind: 'SubEvent',
            message: 'level 2',
            sub_events: [{
              kind: 'SubEvent',
              message: 'level 3',
              sub_events: [{
                kind: 'SubEvent',
                message: 'level 4',
                sub_events: [{
                  kind: 'SubEvent',
                  message: 'level 5',
                  sub_events: [],
                }],
              }],
            }],
          }]
        };
        const subEvent = SubEvent(multiLevel);

        assert.deepStrictEqual(multiLevel, subEvent.toJSON());
      });

      it('allow multiple levels of data in the schema when the base schema has _id without auto', function() {
        const singleEventSchema = new Schema({
          _id: { type: Number, required: true },
          message: String,
        }, { discriminatorKey: 'kind' });

        const subEventSchema = new Schema({
          sub_events: [singleEventSchema]
        });

        subEventSchema.path('sub_events').discriminator('SubEvent', subEventSchema);

        // To create a recursive document, the schema was modified, so the _id property is now a number
        assert.equal(subEventSchema.path('_id').instance, 'Number');

        let currentEventLevel = subEventSchema;
        for (let i = 0; i < 5; i++) {
          const subEventSchemaDiscriminators = currentEventLevel.path('sub_events').schema.discriminators;
          assert.ok(subEventSchemaDiscriminators);
          assert.ok(subEventSchemaDiscriminators.SubEvent);
          currentEventLevel = subEventSchemaDiscriminators.SubEvent;
          assert.equal(currentEventLevel.path('_id').instance, 'Number');
        }
      });

      it('allow multiple levels of data in a document when the base schema has _id without auto', function() {
        const singleEventSchema = new Schema({
          _id: { type: Number, required: true },
          message: String,
        }, { discriminatorKey: 'kind' });

        const subEventSchema = new Schema({
          sub_events: [singleEventSchema]
        });

        subEventSchema.path('sub_events').discriminator('SubEvent', subEventSchema);

        const SubEvent = mongoose.model('MultiLevelDataWithIdDoc', subEventSchema);
        const multiLevel = {
          // To create a recursive document, the schema was modified, so kind & message are added & _id is now Number
          _id: 1,
          kind: 'SubEvent',
          message: 'level 1',
          sub_events: [{
            _id: 1,
            kind: 'SubEvent',
            message: 'level 2',
            sub_events: [{
              _id: 1,
              kind: 'SubEvent',
              message: 'level 3',
              sub_events: [{
                _id: 1,
                kind: 'SubEvent',
                message: 'level 4',
                sub_events: [{
                  _id: 1,
                  kind: 'SubEvent',
                  message: 'level 5',
                  sub_events: [],
                }],
              }],
            }],
          }]
        };
        const subEvent = SubEvent(multiLevel);

        assert.deepStrictEqual(multiLevel, subEvent.toJSON());
      });
    });
  });
});