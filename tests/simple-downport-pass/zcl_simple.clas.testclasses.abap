CLASS ltcl_simple DEFINITION FOR TESTING RISK LEVEL HARMLESS DURATION SHORT FINAL.

  PRIVATE SECTION.
    METHODS test FOR TESTING RAISING cx_static_check.

ENDCLASS.

CLASS ltcl_simple IMPLEMENTATION.

  METHOD test.
    DATA(simple) = NEW zcl_simple( ).
    cl_abap_unit_assert=>assert_equals(
      act = simple->run( )
      exp = 3 ).
  ENDMETHOD.

ENDCLASS.