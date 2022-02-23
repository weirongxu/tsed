import {DynamicRef, MongooseModel, ObjectID, Ref} from "../src";
import {Model} from "../src/decorators/model";
import {Enum, Required} from "@tsed/schema";
import {TestMongooseContext} from "@tsed/testing-mongoose";
import {Server} from "./helpers/Server";
import {serialize} from "@tsed/json-mapper";

describe("DynamicRef Integration", () => {
  @Model()
  class ClickedLinkEventModel {
    @ObjectID("id")
    _id: string;

    @Required()
    url: string;
  }

  @Model()
  class SignedUpEventModel {
    @ObjectID("id")
    _id: string;

    @Required()
    user: string;
  }

  @Model()
  class EventModel {
    @ObjectID("id")
    _id: string;

    @DynamicRef("eventType")
    event: Ref<ClickedLinkEventModel | SignedUpEventModel>;

    @Enum("ClickedLinkEventModel", "SignedUpEventModel")
    eventType: "ClickedLinkEventModel" | "SignedUpEventModel";
  }

  beforeEach(TestMongooseContext.bootstrap(Server));
  afterEach(TestMongooseContext.clearDatabase);
  afterEach(TestMongooseContext.reset);

  it("should serialize (clickedEvent)", async () => {
    const EventRepository = TestMongooseContext.get<MongooseModel<EventModel>>(EventModel);
    const ClickedEventRepository = TestMongooseContext.get<MongooseModel<ClickedLinkEventModel>>(ClickedLinkEventModel);

    const clickedEvent = await new ClickedEventRepository({url: "https://www.tsed.io"}).save();
    const event1 = await new EventRepository({eventType: "ClickedLinkEventModel", event: clickedEvent}).save();

    const result1 = serialize(event1, {type: EventModel});

    expect(result1).toEqual({
      id: event1.id,
      eventType: "ClickedLinkEventModel",
      event: {_id: clickedEvent.id, url: "https://www.tsed.io"}
    });
  });

  it("should serialize (SignedUpEventModel)", async () => {
    const EventRepository = TestMongooseContext.get<MongooseModel<EventModel>>(EventModel);
    const SignedUpEventRepository = TestMongooseContext.get<MongooseModel<SignedUpEventModel>>(SignedUpEventModel);

    const signedUpEvent = await new SignedUpEventRepository({user: "test"}).save();
    const event = await new EventRepository({eventType: "SignedUpEventModel", event: signedUpEvent}).save();

    const result = serialize(event, {type: EventModel});

    expect(result).toStrictEqual({
      id: event.id,
      eventType: "SignedUpEventModel",
      event: {id: signedUpEvent.id, user: "test"}
    });
  });
});
