CLASS ltcl_hello_world DEFINITION FOR TESTING RISK LEVEL HARMLESS DURATION SHORT FINAL.

  PUBLIC SECTION.
    INTERFACES if_oo_adt_classrun_out.

  PRIVATE SECTION.
    METHODS test FOR TESTING RAISING cx_static_check.
    DATA text TYPE string.

ENDCLASS.

CLASS ltcl_hello_world IMPLEMENTATION.

  METHOD test.
    DATA hello TYPE REF TO zcl_hello_world.
    CREATE OBJECT hello.
    hello->if_oo_adt_classrun~main( me ).
    cl_abap_unit_assert=>assert_equals(
      act = if_oo_adt_classrun_out~get( )
      exp = 'Hello, World' ).
  ENDMETHOD.

  METHOD if_oo_adt_classrun_out~write.
    text = data.
  ENDMETHOD.

  METHOD if_oo_adt_classrun_out~get.
    output = text.
  ENDMETHOD.

ENDCLASS.