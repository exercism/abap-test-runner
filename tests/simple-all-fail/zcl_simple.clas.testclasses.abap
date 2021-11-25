CLASS ltcl_simple DEFINITION FOR TESTING RISK LEVEL HARMLESS DURATION SHORT FINAL.

  PRIVATE SECTION.
    METHODS test1 FOR TESTING RAISING cx_static_check.
    METHODS test2 FOR TESTING RAISING cx_static_check.

ENDCLASS.

CLASS ltcl_simple IMPLEMENTATION.

  METHOD test1.
    cl_abap_unit_assert=>assert_equals(
      act = 2
      exp = 123 ).
  ENDMETHOD.

  METHOD test2.
    cl_abap_unit_assert=>assert_equals(
      act = 2
      exp = 36 ).
  ENDMETHOD.

ENDCLASS.