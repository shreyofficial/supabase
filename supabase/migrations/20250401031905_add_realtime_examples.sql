CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";

CREATE OR REPLACE FUNCTION "public"."insert_random_example_logging_data"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    random_message text;
    random_level text;
BEGIN
    -- Generate a random message
    random_message := 'Random message ' || floor(random() * 1000)::text;
    
    -- Generate a random log level (for example: INFO, WARNING, ERROR)
    random_level := CASE floor(random() * 3)
        WHEN 0 THEN 'INFO'
        WHEN 1 THEN 'WARNING'
        ELSE 'ERROR'
    END;

    -- Insert the new record into logging_data
    INSERT INTO public.example_logging_data (log_message, log_level, created_at)
    VALUES (random_message, random_level, NOW());
END;
$$;

ALTER FUNCTION "public"."insert_random_example_logging_data"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."example_logging_data_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    PERFORM realtime.broadcast_changes(
        'logs',                      -- topic
        TG_OP,                       -- event
        TG_OP,                       -- operation
        TG_TABLE_NAME,               -- table
        TG_TABLE_SCHEMA,             -- schema
        NEW,                         -- new record
        OLD                          -- old record
    );
    RETURN NULL;
END;
$$;

ALTER FUNCTION "public"."example_logging_data_changes"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."example_todos_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    PERFORM realtime.broadcast_changes(
	    'todos:' || COALESCE(NEW.channel, OLD.channel)::text,   -- topic
		   TG_OP,                          -- event
		   TG_OP,                          -- operation
		   TG_TABLE_NAME,                  -- table
		   TG_TABLE_SCHEMA,                -- schema
		   NEW,                            -- new record
		   OLD                             -- old record
		);
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."example_todos_changes"() OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."example_logging_data" (
    "id" bigint NOT NULL,
    "log_message" "text" NOT NULL,
    "log_level" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."example_logging_data" OWNER TO "postgres";

ALTER TABLE "public"."example_logging_data" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."example_logging_data_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE ONLY "public"."example_logging_data" ADD CONSTRAINT "example_logging_data_pkey" PRIMARY KEY ("id");

CREATE TABLE IF NOT EXISTS "public"."example_todos" (
    "id" bigint NOT NULL,
    "created_by" "uuid",
    "completed" boolean DEFAULT false NOT NULL,
    "text" "text" NOT NULL,
    "channel" "text" NOT NULL
);

ALTER TABLE "public"."example_todos" OWNER TO "postgres";

ALTER TABLE "public"."example_todos" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."example_todos_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE ONLY "public"."example_todos" ADD CONSTRAINT "example_todos_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."example_todos" ADD CONSTRAINT "example_todos_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

CREATE INDEX "idx_created_by" ON "public"."example_todos" USING "btree" ("created_by");

CREATE OR REPLACE TRIGGER "broadcast_changes_for_example_logging_data_trigger" AFTER INSERT ON "public"."example_logging_data" FOR EACH ROW EXECUTE FUNCTION "public"."example_logging_data_changes"();

CREATE OR REPLACE TRIGGER "broadcast_changes_for_example_todos_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."example_todos" FOR EACH ROW EXECUTE FUNCTION "public"."example_todos_changes"();

CREATE POLICY "Allow delete example_todos by channel" ON "public"."example_todos" FOR DELETE TO "authenticated" USING (("channel" = ( SELECT (("auth"."jwt"() -> 'user_metadata'::"text") ->> 'instanceId'::"text"))));

CREATE POLICY "Allow insert example_todos by channel" ON "public"."example_todos" FOR INSERT TO "authenticated" WITH CHECK (("channel" = ( SELECT (("auth"."jwt"() -> 'user_metadata'::"text") ->> 'instanceId'::"text"))));

CREATE POLICY "Allow select example_todos by channel" ON "public"."example_todos" FOR SELECT TO "authenticated" USING (("channel" = ( SELECT (("auth"."jwt"() -> 'user_metadata'::"text") ->> 'instanceId'::"text"))));

CREATE POLICY "Allow update example_todos by channel" ON "public"."example_todos" FOR UPDATE TO "authenticated" USING (("channel" = ( SELECT (("auth"."jwt"() -> 'user_metadata'::"text") ->> 'instanceId'::"text")))) WITH CHECK (("channel" = ( SELECT (("auth"."jwt"() -> 'user_metadata'::"text") ->> 'instanceId'::"text"))));

CREATE POLICY "Allow read access for all users" ON "public"."example_logging_data" FOR SELECT TO "authenticated", "anon" USING (true);

CREATE POLICY "Allow listening for SELECT broadcasts from the example_todos channel" ON "realtime"."messages" FOR SELECT TO "authenticated", "anon" USING (((extension = 'broadcast'::text) AND (realtime.topic() LIKE 'todos:%')));

CREATE POLICY "Allow listening for INSERT broadcasts from the example_todos channel" ON "realtime"."messages" FOR INSERT TO "authenticated", "anon" WITH CHECK (((extension = 'broadcast'::text) AND (realtime.topic() LIKE 'todos:%')));

CREATE POLICY "Allow listening for SELECT broadcasts from the logs channel" ON "realtime"."messages" FOR SELECT TO "authenticated", "anon" USING (((extension = 'broadcast'::text) AND (realtime.topic() = 'logs'::text)));

ALTER TABLE "public"."example_logging_data" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."example_todos" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON FUNCTION "public"."insert_random_example_logging_data"() TO "postgres";
GRANT ALL ON FUNCTION "public"."insert_random_example_logging_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."insert_random_example_logging_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_random_example_logging_data"() TO "service_role";

GRANT ALL ON FUNCTION "public"."example_logging_data_changes"() TO "postgres";
GRANT ALL ON FUNCTION "public"."example_logging_data_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."example_logging_data_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."example_logging_data_changes"() TO "service_role";

GRANT ALL ON FUNCTION "public"."example_todos_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."example_todos_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."example_todos_changes"() TO "service_role";

GRANT ALL ON TABLE "public"."example_logging_data" TO "anon";
GRANT ALL ON TABLE "public"."example_logging_data" TO "authenticated";
GRANT ALL ON TABLE "public"."example_logging_data" TO "service_role";

GRANT ALL ON SEQUENCE "public"."example_logging_data_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."example_logging_data_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."example_logging_data_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."example_todos" TO "anon";
GRANT ALL ON TABLE "public"."example_todos" TO "authenticated";
GRANT ALL ON TABLE "public"."example_todos" TO "service_role";

GRANT ALL ON SEQUENCE "public"."example_todos_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."example_todos_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."example_todos_id_seq" TO "service_role";

SELECT cron.schedule('Log Viewer Example Cron', '5 seconds', 'SELECT public.insert_random_example_logging_data();');
SELECT cron.schedule('Log Viewer Cleanup', '0 0 * * *', 'truncate public.example_logging_data');